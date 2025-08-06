const express = require("express");
const { connectDB, prisma } = require("./configs/prisma.config");
const { DBconnectionHandling } = require("./configs/DB.config");

const app = express();

app.use(express.json());

app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log("Prisma client connected");
  console.log(`Server is running on port ${process.env.PORT}`);
});

DBconnectionHandling();

module.exports = app;
