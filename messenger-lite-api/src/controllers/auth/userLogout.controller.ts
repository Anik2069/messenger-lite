import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../libs/sendResponse";

export const userLogout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Clear the access token cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict",
    });

    // Return success response
    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User logged out successfully",
      data: null, // optional, can omit
    });
  } catch (error) {
    console.error("Logout error:", error);

    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Internal server error during logout",
      data: null,
    });
  }
};
