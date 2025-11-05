// src/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances of Prisma Client in development
  // Allows hot reload without creating new connections
  var prisma: PrismaClient | undefined;
}

// Use existing Prisma client if available, otherwise create new
export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ["query", "warn", "error"],
  });

// Only set global in development
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// Optional: helper to connect (for local/dev usage)
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log("Prisma client connected");
  } catch (err) {
    console.error("Prisma connection failed:", err);
    process.exit(1);
  }
};

// Optional: helper to disconnect (mainly for local dev)
export const disconnectPrismaClient = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log("Prisma client disconnected");
  } catch (err) {
    console.error("Prisma disconnection failed:", err);
  }
};
