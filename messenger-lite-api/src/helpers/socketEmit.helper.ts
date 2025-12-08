import { IOServerWithHelpers } from "../socket/initSocket";

export default function emitToRecipients(io: IOServerWithHelpers, event: string, toUserIds: string | string[], payload: any) {
    if (Array.isArray(toUserIds)) {
        toUserIds.forEach((id) => io.to(id).emit(event, payload))
    }
    else {
        io.to(toUserIds).emit(event, payload)
    }
}
