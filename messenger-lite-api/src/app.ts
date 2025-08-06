const express = require("express");
const { connectDB, prisma } = require("./configs/prisma.config");
const { DBconnectionHandling } = require("./configs/DB.config");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const { globalErrorHandler, ApiError } = require("./src/libs/error");
import type { Request, Response, NextFunction, Application } from "express";

const messeangerLite_v1_router = require("./modules/v1/messeangerLite_v1_router");

const origins = require("./constant/origins");

const app: Application = express();

app.use(cors({ origin: origins, credentials: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.listen(process.env.PORT, async () => {
  // await connectDB();
  console.log("Prisma client connected");
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.get("/health", async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Server is healthy 100%" });
});

app.use("/api/v1", messeangerLite_v1_router);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(
    404,
    `Can't find ${req.originalUrl} on this server!`
  );
  next(error);
});
app.use(globalErrorHandler);

// DBconnectionHandling();

module.exports = app;
