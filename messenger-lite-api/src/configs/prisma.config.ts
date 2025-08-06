import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Connect Prisma client
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Prisma client connected");
  } catch (err) {
    console.error("Prisma connection failed:", err);
    process.exit(1);
  }
};

// Disconnect Prisma client gracefully
export const disconnectPrismaClient = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("Prisma client disconnected");
  } catch (err) {
    console.error("Prisma disconnection failed:", err);
  }
};
