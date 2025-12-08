import { Prisma } from "./../../prisma/generated/client/client.js";

export function buildWhereClause(query: any): Prisma.TransactionWhereInput {
    const {
        startDate, endDate,
        paymentMethod,
        gender, customerRegion, minAge, maxAge,
        customerNamePrefix, phonePrefix,
        productCategory, tags
    } = query;

    const where: Prisma.TransactionWhereInput = {};

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lt = new Date(endDate);
    }

    if (paymentMethod) {
        where.paymentMethod = { equals: paymentMethod };
    }

    const hasCustomerFilters =
        gender || customerRegion || minAge || maxAge || 
        customerNamePrefix || phonePrefix;

    if (hasCustomerFilters) {
        if (!where.customer) where.customer = {};

        if (gender) where.customer.gender = gender;
        if (customerRegion) where.customer.customerRegion = customerRegion;

        if (minAge || maxAge) {
            if (!where.customer.age) {
                where.customer.age = {};
            }
            if (minAge) (where.customer.age as Prisma.IntFilter).gte = parseInt(minAge);
            if (maxAge) (where.customer.age as Prisma.IntFilter).lte = parseInt(maxAge);
        }

        if (customerNamePrefix) {
            where.customer.customerName = {
                startsWith: customerNamePrefix,
                mode: "insensitive",
            };
        }

        if (phonePrefix) {
            where.customer.phoneNumber = {
                startsWith: phonePrefix,
                mode: "insensitive",
            };
        }
    }

    const hasProductFilters = productCategory || tags;

    if (hasProductFilters) {
        if (!where.product) where.product = {};

        if (productCategory) {
            where.product.productCategory = {
                equals: productCategory,
                mode: "insensitive",
            };
        }

        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(",");
            where.product.tags = { hasEvery: tagArray };
        }
    }

    return where;
}
