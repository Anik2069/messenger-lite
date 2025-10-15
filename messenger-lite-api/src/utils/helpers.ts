import rateLimit from "express-rate-limit";

export const twoFALimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 6, // limit 6 requests per minute per IP
  message: { error: "Too many requests, try again later." },
});
