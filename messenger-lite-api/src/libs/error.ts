// src/libs/error.ts
import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { Writable } from "stream";
import { Request, Response, NextFunction } from "express";
import { deleteFile } from "./utility";
import { handlePrismaError } from "./QueryError";
import {
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";

// Replace this with your actual log stream
const errorLogStream: Writable = process.stdout; // Example, replace with real stream

export class ApiError extends Error {
  public statusCode: number;
  public status: "fail" | "error";
  public isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Delete files from request if present
const allFileDelete = (req: Request & { files?: any }): void => {
  const files = req?.files;
  if (!files) return;

  if (Array.isArray(files)) {
    files.forEach((file) => {
      if (file?.path) deleteFile(file.path);
    });
  } else if (typeof files === "object") {
    for (const key in files) {
      const f = files[key];
      if (Array.isArray(f)) {
        f.forEach((file) => file?.path && deleteFile(file.path));
      } else if (f?.path) {
        deleteFile(f.path);
      }
    }
  }
};

export const globalErrorHandler = (
  err: any,
  req: Request & { files?: any },
  res: Response,
  next: NextFunction
): Response => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const status = err.status || "error";
  const errorId = Date.now();

  const errorLogDetails = {
    errorId,
    status,
    statusCode,
    url: req.originalUrl,
    message: err.message,
    timestamp: new Date().toISOString(),
  };
  errorLogStream.write(JSON.stringify(errorLogDetails, null, 2));

  let message = "Internal server error";
  let code = statusCode;

  if (err?.isOperational) {
    code = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    code = StatusCodes.BAD_REQUEST;
    message = err.issues
      .map((issue) => `${issue.path.join(".")} is ${issue.message}`)
      .join(", ");
  } else if (err instanceof PrismaClientKnownRequestError) {
    const formattedError = handlePrismaError(err.code);
    code = formattedError.httpStatus;
    message = formattedError.message;
  } else if (err instanceof PrismaClientValidationError) {
    code = StatusCodes.UNPROCESSABLE_ENTITY;
    message = err.message;
  } else if (
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientRustPanicError ||
    err instanceof PrismaClientUnknownRequestError
  ) {
    code = StatusCodes.INTERNAL_SERVER_ERROR;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  } else if (err.code === "P2025") {
    code = StatusCodes.NOT_FOUND;
    message = "Data not found by id";
  } else if (err.code === "P2002") {
    code = StatusCodes.BAD_REQUEST;
    message = "Employee certificate is in used with another table";
  }

  // Delete uploaded files if any
  allFileDelete(req);

  return res.status(code).json({
    status,
    statusCode: code,
    url: req.originalUrl,
    message,
    timestamp: new Date().toISOString(),
    errorId,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
