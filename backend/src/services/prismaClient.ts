import 'dotenv/config';
import { PrismaClient } from './../../prisma/generated/client/client.js'
import { Prisma } from "./../../prisma/generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 20,
});


const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter, transactionOptions: {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 15000,
  },
},);

export default prisma;