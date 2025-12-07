import 'dotenv/config';
import { PrismaClient } from "src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Prisma } from 'src/generated/prisma';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!
});


const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;