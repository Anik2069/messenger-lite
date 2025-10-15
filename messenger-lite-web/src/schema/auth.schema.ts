import * as z from "zod";

export const getSchema = (isLogin: boolean) =>
  z.object({
    username: isLogin
      ? z.string().optional()
      : z
          .string()
          .min(2, "Username must be at least 2 characters")
          .regex(
            /^[a-zA-Z0-9_.]+$/,
            "Username can contain letters, numbers, _ and . only"
          )
          .nonempty("Username is required"),
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .nonempty("Password is required"),
  });

export type FormValues = z.infer<ReturnType<typeof getSchema>>;
