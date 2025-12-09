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
        const paymentMethods = Array.isArray(paymentMethod) ? paymentMethod : [paymentMethod];
        if (paymentMethods.length > 0) {
            where.paymentMethod = {
                in: paymentMethods,
                mode: "insensitive"
            };
        }
    }

    const hasCustomerFilters =
        gender || customerRegion || minAge || maxAge ||
        customerNamePrefix || phonePrefix;

    if (hasCustomerFilters) {
        where.customer = {};

        if (gender) {
            const genders = Array.isArray(gender) ? gender : [gender];
            if (genders.length > 0) {
                where.customer.gender = { in: genders };
            }
        }

        if (customerRegion) {
            const regions = Array.isArray(customerRegion) ? customerRegion : [customerRegion];
            if (regions.length > 0) {
                where.customer.customerRegion = { in: regions };
            }
        }

        if (minAge || maxAge) {
            where.customer.age = {};
            if (minAge) where.customer.age.gte = parseInt(minAge);
            if (maxAge) where.customer.age.lte = parseInt(maxAge);
        }

        if (customerNamePrefix) {
            where.customer.customerName = {
                startsWith: customerNamePrefix,
                mode: "insensitive"
            };
        }
        if (phonePrefix) {
            where.customer.phoneNumber = {
                startsWith: phonePrefix,
                mode: "insensitive"
            };
        }
    }

    const hasProductFilters = productCategory || tags;
    if (hasProductFilters) {
        where.product = {};

        if (productCategory) {
            const categories = Array.isArray(productCategory) ? productCategory : [productCategory];
            if (categories.length > 0) {
                where.product.productCategory = {
                    in: categories,
                    mode: "insensitive"
                };
            }
        }

        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(",");
            where.product.tags = { hasEvery: tagArray };
        }
    }

    return where;
}
