import { Request, Response } from "express";
import { Prisma } from "./../../prisma/generated/client/client.js"
import prisma from "./../services/prismaClient.js"
import type {
    TransactionsApiResponse,
    ApiErrorResponse,
    TransactionResponse
} from "./../utils/ResponseTypes/queryResponse"
import type { TransactionsQueryParams } from "./../utils/RequestTypes/queryRequest";
import { buildWhereClause } from "./../utils/buildFilters";

class QueryController {
    async queryTransactions(
        req: Request<{}, any, any, TransactionsQueryParams>,
        res: Response<TransactionsApiResponse | ApiErrorResponse>
    ): Promise<void> {
        const page = parseInt(req.query.page || '1') || 1;
        const limit = Math.min(parseInt(req.query.limit || '10'), 100);

        const {
            orderBy: orderByParam = 'customerName',
            orderByType = 'asc'
        } = req.query;

        try {
            const skip = (page - 1) * limit;
            const where = buildWhereClause(req.query);

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

            const rawData = await prisma.transaction.findMany({
                select: {
                    transactionId: true,
                    date: true,
                    customerId: true,
                    productId: true,
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
            })

            const totalRaw = await prisma.transaction.count({ where })

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

    async getTotalUnitsSold(req: Request, res: Response) {
        try {
            const where = buildWhereClause(req.query);

            const result = await prisma.transaction.aggregate({
                where,
                _sum: { quantity: true }
            });

            res.json({
                success: true,
                totalUnitsSold: Number(result._sum.quantity || 0)
            });
        } catch (error) {
            console.error("Total units sold error:", error);
            res.status(500).json({ success: false, error: "Failed to fetch total units sold" });
        }
    }


    async getTotalAmount(req: Request, res: Response) {
        try {
            const where = buildWhereClause(req.query);

            const result = await prisma.transaction.aggregate({
                where,
                _sum: { totalAmount: true },
                _count: true
            });

            res.json({
                success: true,
                totalAmount: Number(result._sum.totalAmount || 0),
                salesRecords: result._count
            });
        } catch (error) {
            console.error("Total amount error:", error);
            res.status(500).json({ success: false, error: "Failed to fetch total amount" });
        }
    }


    async getTotalDiscount(req: Request, res: Response) {
        try {
            const where = buildWhereClause(req.query);

            const result = await prisma.transaction.aggregate({
                where,
                _sum: {
                    totalAmount: true,
                    finalAmount: true
                },
                _count: true
            });

            const totalDiscount =
                Number(result._sum.totalAmount || 0) -
                Number(result._sum.finalAmount || 0);

            res.json({
                success: true,
                totalDiscount,
                discountRecords: result._count
            });
        } catch (error) {
            console.error("Total discount error:", error);
            res.status(500).json({ success: false, error: "Failed to fetch total discount" });
        }
    }



}

export default new QueryController();
