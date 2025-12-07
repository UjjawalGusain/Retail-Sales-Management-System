import { Request, Response } from "express";
import { Prisma } from "src/generated/prisma";
import prisma from "src/services/prismaClient";
import type {
    TransactionsApiResponse,
    ApiErrorResponse,
    TransactionResponse
} from "./../utils/ResponseTypes/queryResponse"
import type { TransactionsQueryParams } from "./../utils/RequestTypes/queryRequest";

class QueryController {
    async queryTransactions(
        req: Request<{}, any, any, TransactionsQueryParams>,
        res: Response<TransactionsApiResponse | ApiErrorResponse>
    ): Promise<void> {
        const page = parseInt(req.query.page || '1') || 1;
        const limit = Math.min(parseInt(req.query.limit || '10'), 100);

        const {
            startDate, endDate,
            paymentMethod,
            gender, customerRegion, minAge, maxAge,
            customerNamePrefix, phonePrefix,
            productCategory, tags,
            orderBy: orderByParam = 'customerName',
            orderByType = 'asc'
        } = req.query;

        try {
            const skip = (page - 1) * limit;
            const where: Prisma.TransactionWhereInput = {};

            if (startDate || endDate) {
                where.date = {};
                if (startDate) where.date!.gte = new Date(startDate);
                if (endDate) where.date!.lt = new Date(endDate);
            }

            if (paymentMethod) {
                where.paymentMethod = {
                    equals: paymentMethod,
                    mode: 'insensitive'
                };
            }

            const hasCustomerFilters = gender || customerRegion || minAge || maxAge ||
                customerNamePrefix || phonePrefix;
            if (hasCustomerFilters) {
                where.customer = {};

                if (gender) where.customer!.gender = gender;
                if (customerRegion) where.customer!.customerRegion = customerRegion;

                if (minAge || maxAge) {
                    where.customer!.age = {};
                    if (minAge) where.customer!.age!.gte = parseInt(minAge);
                    if (maxAge) where.customer!.age!.lte = parseInt(maxAge);
                }

                if (customerNamePrefix) {
                    where.customer!.customerName = {
                        startsWith: customerNamePrefix,
                        mode: 'insensitive'
                    };
                }

                if (phonePrefix) {
                    where.customer!.phoneNumber = {
                        startsWith: phonePrefix,
                        mode: 'insensitive'
                    };
                }
            }

            const hasProductFilters = productCategory || tags;
            if (hasProductFilters) {
                where.product = {};

                if (productCategory) {
                    where.product!.productCategory = {
                        equals: productCategory,
                        mode: 'insensitive'
                    };
                }

                if (tags) {
                    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
                    where.product!.tags = { hasEvery: tagArray };
                }
            }

            type SortableField = 'customerName' | 'totalAmount' | 'date' | 'quantity';
            const validSortFields: SortableField[] = ['customerName', 'totalAmount', 'date', 'quantity'];
            const validDirections = ['asc', 'desc'];

            const safeOrderBy: SortableField = validSortFields.includes(orderByParam as SortableField)
                ? (orderByParam as SortableField)
                : 'customerName';
            const safeDirection = validDirections.includes(orderByType as string)
                ? (orderByType as 'asc' | 'desc')
                : 'asc';

            const orderByMap: Record<SortableField, Prisma.TransactionOrderByWithRelationInput> = {
                customerName: { customer: { customerName: safeDirection } },
                totalAmount: { totalAmount: safeDirection },
                date: { date: safeDirection },
                quantity: { quantity: safeDirection }
            };

            const orderBy = orderByMap[safeOrderBy];

            const [rawData, totalRaw] = await Promise.all([
                prisma.transaction.findMany({
                    select: {
                        transactionId: true,
                        date: true,
                        customerId: true,
                        quantity: true,
                        totalAmount: true,
                        employeeName: true,
                        customer: {
                            select: {
                                customerName: true,
                                phoneNumber: true,
                                gender: true,
                                age: true,
                                customerRegion: true
                            }
                        },
                        product: {
                            select: { productCategory: true }
                        }
                    },
                    where,
                    orderBy,
                    skip,
                    take: limit
                }),
                prisma.transaction.count({ where })
            ]);

            const data: TransactionResponse[] = rawData.map((transaction: any) => ({
                ...transaction,
                transactionId: transaction.transactionId.toString()
            }));

            const response: TransactionsApiResponse = {
                success: true,
                data,
                pagination: {
                    page,
                    limit,
                    total: Number(totalRaw),
                    totalPages: Math.ceil(Number(totalRaw) / limit),
                    hasNext: skip + limit < Number(totalRaw),
                    hasPrev: page > 1,
                    filters: req.query as Record<string, string | string[] | undefined>
                },
                sort: {
                    orderBy: safeOrderBy,
                    orderByType: safeDirection
                }
            };


            res.json(response);

        } catch (error) {
            console.error('Transaction query error:', error);
            const errorResponse: ApiErrorResponse = {
                success: false,
                error: 'Failed to fetch transactions',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            };
            res.status(500).json(errorResponse);
        }
    }
}

export default new QueryController();
