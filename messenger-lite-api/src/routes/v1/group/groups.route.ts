import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { IOServerWithHelpers } from "../../../socket/initSocket";
import requireAuth from "../../../middlewares/requireAuth";
import { upload } from "../../../middlewares/upload.middleware";
import CreateGroupConversation from "../../../controllers/group/CreateGroupConversation.controller";
import getGroupInfo from "../../../controllers/group/getGroupInfo.controller";

const groupsRouter = (io: IOServerWithHelpers) => {
    const prisma = new PrismaClient();
    const router = Router();
    router.post(
        "/create",
        requireAuth,
        upload.single("avatar"),
        CreateGroupConversation(io, prisma)
    );
    router.get(
        "/group-info/:conversationId",
        requireAuth,
        getGroupInfo(io, prisma)
    );


    return router
}
export default groupsRouter
