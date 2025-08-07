import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { prisma } from "../../configs/prisma.config";

// Validation Schema
const userSignupDto = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const userSignup = async (req: any, res: any) => {
  try {
    const { username, email, password } = userSignupDto.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "User already exists with this email or username",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation Error",
        errors: error.issues,
      });
    }

    console.error("Signup error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export { userSignup };
