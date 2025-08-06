const { disconnectPrismaClient } = require("./prisma.config");

const DBconnectionHandling = () => {
  process.on("SIGINT", async () => {
    try {
      await disconnectPrismaClient();
      process.exit(0);
    } catch (error) {
      console.error("Error closing Prisma connection:", error);
    }
  });

  process.on("SIGTERM", async () => {
    try {
      await disconnectPrismaClient();
      process.exit(0);
    } catch (error) {
      console.error("Error closing Prisma connection:", error);
    }
  });
};

module.exports = { DBconnectionHandling };
