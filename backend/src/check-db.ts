import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to the database.');
    const count = await prisma.user.count();
    console.log(`Current user count: ${count}`);
  } catch (e) {
    console.error('❌ Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
