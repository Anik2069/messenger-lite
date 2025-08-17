import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";

interface DecodedToken {
  email: string;
  iat?: number;
  exp?: number;
}

const getEmailFromToken = (accessToken: string): string | null => {
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.SECRET as string
    ) as DecodedToken;

    return decoded.email;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

const getEmailFromTokenMiddleware = (
  req: Request,
  res: Response
): string | Response => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No access token provided",
    });
  }

  const email = getEmailFromToken(accessToken);

  if (!email) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid or expired access token",
    });
  }

  return email;
};

export { getEmailFromToken, getEmailFromTokenMiddleware };
