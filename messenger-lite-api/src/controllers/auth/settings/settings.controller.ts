import sendResponse from "../../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { prisma } from "../../../configs/prisma.config";

type PartialSettingsPayload = {
  theme?: string;
  soundNotifications?: boolean;
  activeStatus?: boolean;
};

/**
 * GET /settings/my-settings
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) {
      return sendResponse({
        res,
        statusCode: StatusCodes.UNAUTHORIZED,
        message: "User not authenticated",
      });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // If you prefer returning defaults instead of 404, you can return defaults here.
      return sendResponse({
        res,
        statusCode: StatusCodes.NOT_FOUND,
        message: "Settings not found for user",
      });
    }

    return sendResponse({
      res,
      statusCode: StatusCodes.OK,
      message: "User settings retrieved successfully",
      data: settings, // frontend expects `response.data.results`
    });
  } catch (error: any) {
    console.error("getSettings error:", error);
    return sendResponse({
      res,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "An error occurred while retrieving settings",
    });
  }
};

/**
 * PATCH /settings/update-my-settings
 *
 * Expects a flat body with only the settings fields you want to update:
 * { theme?: "LIGHT"|"DARK"|"SYSTEM", soundNotifications?: boolean, activeStatus?: boolean }
 *
 * We use upsert so if a user has no settings row yet, it will be created.
 */
export const updateSettings =
  (io: any, prismaClient: typeof prisma) =>
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) {
        return sendResponse({
          res,
          statusCode: StatusCodes.UNAUTHORIZED,
          message: "User not authenticated",
        });
      }

      // Accept flat payload (not nested)
      const payload = req.body as PartialSettingsPayload;

      // Validate payload minimally
      const allowed: PartialSettingsPayload = {};
      if (typeof payload.soundNotifications === "boolean")
        allowed.soundNotifications = payload.soundNotifications;
      if (typeof payload.activeStatus === "boolean")
        allowed.activeStatus = payload.activeStatus;
      if (typeof payload.theme === "string")
        allowed.theme = (payload.theme || "").toUpperCase();

      // If no valid fields to update, return bad request
      if (
        allowed.theme === undefined &&
        allowed.soundNotifications === undefined &&
        allowed.activeStatus === undefined
      ) {
        return sendResponse({
          res,
          statusCode: StatusCodes.BAD_REQUEST,
          message: "No valid settings provided to update",
        });
      }

      // Upsert the user settings row (create if missing)
      const updated = await prismaClient.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          theme: (allowed.theme as any) || "LIGHT",
          soundNotifications: allowed.soundNotifications ?? false,
          activeStatus: allowed.activeStatus ?? false,
        },
        update: {
          ...(allowed.theme !== undefined && { theme: allowed.theme as any }),
          ...(allowed.soundNotifications !== undefined && {
            soundNotifications: allowed.soundNotifications,
          }),
          ...(allowed.activeStatus !== undefined && {
            activeStatus: allowed.activeStatus,
          }),
        },
      });

      // Broadcast to sockets that this user's settings changed
      try {
        io.emit("settings_updated", { userId, settings: updated });
      } catch (e) {
        // Non-fatal - socket might be undefined in some contexts (e.g. unit tests)
        console.warn("Socket emit failed:", e);
      }

      return sendResponse({
        res,
        statusCode: StatusCodes.OK,
        message: "User settings updated successfully",
        data: updated, // frontend reads response.data.results
      });
    } catch (error: any) {
      console.error("updateSettings error:", error);
      return sendResponse({
        res,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "An error occurred while updating settings",
      });
    }
  };
