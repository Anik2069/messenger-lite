const express = require("express");
const { connectDB, prisma } = require("./configs/prisma.config");
const { DBconnectionHandling } = require("./configs/DB.config");
const v1_router = require("./routes/v1/v1_router");

const app = express();

app.use(express.json());

app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log("Prisma client connected");
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.get("/health", async (req: any, res: any) => {
  return res.status(200).json({ message: "Server is healthy 100%" });
});

app.use("/api/v1", v1_router);

DBconnectionHandling();

module.exports = app;
