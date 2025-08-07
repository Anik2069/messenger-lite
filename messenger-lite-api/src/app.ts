// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";

import { connectDB, prisma } from "./configs/prisma.config";
import { DBconnectionHandling } from "./configs/DB.config";
import { ApiError, globalErrorHandler } from "./libs/error";
import v1_routes from "./routes/v1/v1_router";

const app = express();

// Middleware
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3000",
//       "http://localhost:3001",
//       "http://localhost:3002",
//       "http://172.21.16.3:3000",
//     ],
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
// // app.use(morgan("dev"));

// Routes

app.get("/health", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is healthy 100%" });
});

app.use("/api/v1", v1_routes);

// Catch-all for 404
app.all("/", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await connectDB(); // uncomment if you want DB connected on start
    console.log("Prisma client connected");
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error("Failed to connect DB:", error);
  }
});

export default app;
