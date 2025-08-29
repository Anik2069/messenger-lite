import jwt, { SignOptions } from "jsonwebtoken";

export type JWTExpiresIn = `${number}${"s" | "m" | "h" | "d"}`;

export interface JWTPayload {
  [key: string]: any;
}

export function signJWT(payload: JWTPayload, expiresIn: JWTExpiresIn): string {
  const secret = process.env.SECRET;
  if (!secret) throw new Error("Missing SECRET env variable");
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, secret, options);
}

export function verifyJWT(token?: string): { id: string } {
  const secret = process.env.SECRET;
  if (!secret) throw new Error("Missing SECRET env variable");
  if (!token) throw new Error("Missing token");
  const decoded = jwt.verify(token.replace(/^Bearer\s+/i, ""), secret) as any;
  if (!decoded?.id) throw new Error("Invalid token payload");
  return { id: decoded.id };
}
