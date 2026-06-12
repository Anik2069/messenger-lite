import { Request, Response } from "express";
import sendResponse from "../../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../configs/prisma.config";

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).auth?.userId;
        if (!userId) {
            return sendResponse({
                res,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "User not authenticated",
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return sendResponse({
                res,
                statusCode: StatusCodes.NOT_FOUND,
                message: "User not found",
            });
        }

        const { username } = req.body;
        if (!username) {
            return sendResponse({
                res,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "Username is required",
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { username },
        });

        sendResponse({
            res,
            statusCode: StatusCodes.OK,
            message: "Profile updated successfully",
            data: updatedUser,
        });



    } catch (error) {
        return res.status(500).json({
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
};