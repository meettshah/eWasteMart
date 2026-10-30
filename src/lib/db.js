import { prisma } from "./prisma";

let isConnected = false;

/**
 * Connect to PostgreSQL database via Prisma ORM.
 */
export async function connectDb() {
  if (!isConnected) {
    await prisma.$connect();
    isConnected = true;
  }
  return prisma;
}

export const dbConnect = connectDb;
export { prisma };
export default connectDb;
