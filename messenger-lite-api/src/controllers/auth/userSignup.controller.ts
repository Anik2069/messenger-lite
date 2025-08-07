const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const { prisma } = require("@/configs/prisma.config");

const { z } = require("zod");

// Validation Schema
const userSignupDto = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation Error",
        errors: error.errors,
      });
    }

    console.error("Signup error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  userSignup,
};
