import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

export type JWTExpiresIn = `${number}${"s" | "m" | "h" | "d"}`;

export function signJWT<T extends object>(
  payload: T,
  expiresIn: JWTExpiresIn
): string {
  const secret = process.env.SECRET;
  if (!secret) throw new Error("Missing SECRET env variable");
  const options: SignOptions = { expiresIn, algorithm: "HS256" };
  return jwt.sign(payload, secret, options);
}

export function verifyJWT<T extends JwtPayload = any>(token?: string): T {
  const secret = process.env.SECRET;
  if (!secret) throw new Error("Missing SECRET env variable");
  if (!token) throw new Error("Missing token");

  try {
    return jwt.verify(token, secret) as T;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
}
