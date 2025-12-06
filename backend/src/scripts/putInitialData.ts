import fs from "fs";
import csv from "csv-parser";
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!
});


const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });
const BATCH_SIZE = 10000;
const skip_rows = 995042;

async function main() {
    const customersMap = new Map<string, any>();
    const productsMap = new Map<string, any>();

    const stream = fs.createReadStream("truestate_assignment_dataset.csv").pipe(csv());

    for await (const row of stream) {
        const custKey = row["Customer ID"];
        if (!customersMap.has(custKey)) {
            customersMap.set(custKey, {
                customerId: row["Customer ID"],
                customerName: row["Customer Name"],
                phoneNumber: row["Phone Number"],
                gender: row["Gender"],
                age: parseInt(row["Age"]),
                customerRegion: row["Customer Region"],
                customerType: row["Customer Type"],
            });
        }

        const prodKey = row["Product ID"];
        if (!productsMap.has(prodKey)) {
            productsMap.set(prodKey, {
                productId: row["Product ID"],
                productName: row["Product Name"],
                brand: row["Brand"],
                productCategory: row["Product Category"],
                tags: row["Tags"].split(","),
            });
        }
    }

    await prisma.customer.createMany({
        data: Array.from(customersMap.values()),
        skipDuplicates: true,
    });
    console.log(`Inserted ${customersMap.size} customers`);

    await prisma.product.createMany({
        data: Array.from(productsMap.values()),
        skipDuplicates: true,
    });
    console.log(`Inserted ${productsMap.size} products`);

    let transactionBatch: any[] = [];
    const transactionStream = fs.createReadStream("truestate_assignment_dataset.csv").pipe(csv());

    for await (const row of transactionStream) {
        transactionBatch.push({
            transactionId: parseInt(row["Transaction ID"]),
            customerId: row["Customer ID"],
            productId: row["Product ID"],
            quantity: parseInt(row["Quantity"]),
            pricePerUnit: parseFloat(row["Price per Unit"]),
            discountPercent: parseFloat(row["Discount Percentage"]),
            totalAmount: parseFloat(row["Total Amount"]),
            finalAmount: parseFloat(row["Final Amount"]),
            date: new Date(row["Date"]),
            paymentMethod: row["Payment Method"],
            orderStatus: row["Order Status"],
            deliveryType: row["Delivery Type"],
            storeId: row["Store ID"],
            storeLocation: row["Store Location"],
            salespersonId: row["Salesperson ID"],
            employeeName: row["Employee Name"],
        });

        if (transactionBatch.length >= BATCH_SIZE) {
            await prisma.transaction.createMany({ data: transactionBatch, skipDuplicates: true });
            console.log(`Inserted transaction batch: ${transactionBatch.length} records`);
            transactionBatch = [];
        }
    }

    if (transactionBatch.length > 0) {
        await prisma.transaction.createMany({ data: transactionBatch, skipDuplicates: true });
        console.log(`Inserted final transaction batch: ${transactionBatch.length} records`);
    }

    await prisma.$disconnect();
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
