const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const disconnectPrismaClient = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      console.log("Prisma client disconnected");
    } catch (err) {
      console.log("Prisma client disconnection failed");
    }
  }
};

const connectDB = () => prisma.$connect();

module.exports = {
  connectDB,
  prisma,
  disconnectPrismaClient,
};
