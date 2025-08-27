import { MessageType, PrismaClient } from "@prisma/client";
import { Router } from "express";
import { Server as SocketIOServer } from "socket.io";
import sendResponse from "../../../../../libs/sendResponse";
import { StatusCodes } from "http-status-codes";
import SendMessageHandler from "../../../../../controllers/message/SendMessageHandler.controller";

const messagesRouter = (io: SocketIOServer) => {
  const prisma = new PrismaClient();
  const router = Router();

  router.post("/", SendMessageHandler(io, prisma));

  return router;
};

export default messagesRouter;
