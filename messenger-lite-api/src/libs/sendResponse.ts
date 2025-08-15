import { Response } from "express";

interface SendResponseOptions<T = any> {
  res: Response;
  statusCode: number;
  message: string;
  data?: T | null;
}

const sendResponse = <T = any>({
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
