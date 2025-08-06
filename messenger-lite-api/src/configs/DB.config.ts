import { disconnectPrismaClient } from "./prisma.config";

export const DBconnectionHandling = (): void => {
  // Handle Ctrl+C
  process.on("SIGINT", async () => {
    try {
      await disconnectPrismaClient();
      process.exit(0);
    } catch (error) {
      console.error("Error closing Prisma connection:", error);
      process.exit(1);
    }
  });

  // Handle termination signal
  process.on("SIGTERM", async () => {
    try {
      await disconnectPrismaClient();
      process.exit(0);
    } catch (error) {
      console.error("Error closing Prisma connection:", error);
      process.exit(1);
    }
  });
};
