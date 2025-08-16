import jwt, { SignOptions } from "jsonwebtoken";

type JWTExpiresIn = `${number}${"s" | "m" | "h" | "d"}`;

interface Payload {
  [key: string]: any;
}

const getAccessToken = (
  payload: Payload = {},
  expiresIn: JWTExpiresIn
): string => {
  if (!process.env.SECRET) {
    throw new Error("JWT secret is not defined in environment variables.");
  }

  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, process.env.SECRET, options);
};

export default getAccessToken;
