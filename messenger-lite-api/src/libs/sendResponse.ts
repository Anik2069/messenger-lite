import { Response } from "express";

interface SendResponseOptions<T = unknown> {
  res: Response;
  statusCode: number;
  message: string;
  data?: T | null;
}

const sendResponse = <T = unknown>({
  res,
  statusCode,
  message,
  data = null,
}: SendResponseOptions<T>): Response => {
  return res.status(statusCode).json({
    statusCode,
    message,
    results: data,
    timestamp: new Date().toISOString(),
  });
};

export default sendResponse;
