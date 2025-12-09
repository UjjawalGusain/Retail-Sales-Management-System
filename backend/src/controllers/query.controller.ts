import { Request, Response } from "express";
import { Prisma } from "./../../prisma/generated/client/client.js";
import prisma from "./../services/prismaClient.js";
import type {
    LightTransactionsApiResponse,
    ApiErrorResponse,
} from "./../utils/ResponseTypes/queryResponse";
import type { TransactionsQueryParams } from "./../utils/RequestTypes/queryRequest";
import { buildWhereClause } from "./../utils/buildFilters.js";

class QueryController {

    async getTransactionsLight(
        req: Request<{}, any, any, TransactionsQueryParams>,
        res: Response<LightTransactionsApiResponse | ApiErrorResponse>
    ) {
        try {
            const page = parseInt(req.query.page || '1') || 1;
            const limit = Math.min(parseInt(req.query.limit || '10'), 100);
            const skip = (page - 1) * limit;

            const where = buildWhereClause(req.query);

            const { orderBy: orderByParam = 'customerName', orderByType = 'asc' } = req.query;

            const validSortFields = ['customerName', 'totalAmount', 'date', 'quantity'] as const;
            const validDirections = ['asc', 'desc'] as const;

            const safeOrderBy = validSortFields.includes(orderByParam as any)
                ? (orderByParam as any)
                : 'customerName';

            const safeDirection = validDirections.includes(orderByType as any)
                ? (orderByType as any)
                : 'asc';

            const orderBy: Prisma.TransactionOrderByWithRelationInput =
                safeOrderBy === 'customerName'
                    ? { customer: { customerName: safeDirection } }
                    : { [safeOrderBy]: safeDirection };

            const [rawData, totalRaw] = await prisma.$transaction([
                prisma.transaction.findMany({
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
                        product: { select: { productCategory: true } }
                    },
                    where,
                    orderBy,
                    skip,
                    take: limit
                }),
                prisma.transaction.count({ where })
            ],);

            const data = rawData.map((t: any) => ({
                ...t,
                transactionId: t.transactionId.toString()
            }));

            res.json({
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
                sort: { orderBy: safeOrderBy, orderByType: safeDirection }
            });
        } catch (error) {
            console.error("Light Transaction Query Error:", error);
            res.status(500).json({ success: false, error: "Failed to fetch transactions" });
        }
    }

    async getTransactionsHeavy(
        req: Request<{}, any, any, TransactionsQueryParams>,
        res: Response
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page || '1') || 1;
            const limit = Math.min(parseInt(req.query.limit || '10'), 100);
            const skip = (page - 1) * limit;

            const where = buildWhereClause(req.query);

            const { orderBy: orderByParam = 'customerName', orderByType = 'asc' } = req.query;

            const validSortFields = ['customerName', 'totalAmount', 'date', 'quantity'] as const;
            const validDirections = ['asc', 'desc'] as const;

            const safeOrderBy = validSortFields.includes(orderByParam as any)
                ? (orderByParam as any)
                : 'customerName';

            const safeDirection = validDirections.includes(orderByType as any)
                ? (orderByType as any)
                : 'asc';

            const orderBy: Prisma.TransactionOrderByWithRelationInput =
                safeOrderBy === 'customerName'
                    ? { customer: { customerName: safeDirection } }
                    : { [safeOrderBy]: safeDirection };

            const [rawData, counts, totalRaw] = await prisma.$transaction([
                prisma.transaction.findMany({
                    select: {
                        transactionId: true,
                        date: true,
                        customerId: true,
                        productId: true,
                        quantity: true,
                        totalAmount: true,
                        finalAmount: true,
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
                        product: { select: { productCategory: true } }
                    },
                    where,
                    orderBy,
                    skip,
                    take: limit
                }),
                prisma.transaction.aggregate({
                    where,
                    _sum: { quantity: true, totalAmount: true, finalAmount: true },
                    _count: true
                }),
                prisma.transaction.count({ where })
            ]);

            const data = rawData.map(t => ({
                ...t,
                transactionId: t.transactionId.toString()
            }));

            const totalUnitsSold = Number(counts._sum.quantity || 0);
            const totalAmount = Number(counts._sum.totalAmount || 0);
            const totalDiscount = totalAmount - Number(counts._sum.finalAmount || 0);

            res.json({
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
                sort: { orderBy: safeOrderBy, orderByType: safeDirection },
                metrics: {
                    totalUnitsSold,
                    totalAmount,
                    totalDiscount,
                    salesRecords: counts._count
                }
            });

        } catch (error) {
            console.error("Heavy Transaction Query Error:", error);
            res.status(500).json({
                success: false,
                error: "Failed to fetch data"
            });
        }
    }

}

export default new QueryController();
