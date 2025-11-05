import { prisma } from "../../../configs/prisma.config";

import { Request, Response } from "express";
import path from "path";
import fs from "fs";

// PATCH /api/users/profile-picture
export const updateProfilePicture = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth.userId; // from requireAuth middleware
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Optional: remove old profile picture if exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
    if (existingUser?.avatar) {
      const oldPath = path.join(process.cwd(), existingUser.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new file path to DB
    const relativePath = path.join("uploads", file.filename);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: relativePath },
    });

    return res.json({
      message: "Profile picture updated successfully",
      avatar: relativePath,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
