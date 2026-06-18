import { Server, Socket } from "socket.io";
import { verifyJWT } from "../utils/jwt";

// Store active calls in memory (scoped to this module/namespace)
const activeCalls = new Map<string, {
    callerId: string;
    recipients: string[];
    callType: "audio" | "video";
    isGroupCall: boolean;
    timestamp: number;
    status: "ringing" | "answered" | "ended";
    participants: Set<string>;
}>();

// Track which call each socket belongs to (for disconnect cleanup)
const socketToCall = new Map<string, { callId: string; userId: string }>();

export function initCallSocket(io: Server) {
    const callNamespace = io.of("/call");

    // ─── Auth Middleware ───
    // Mirrors the /chat namespace: reject connections without a valid JWT.
    // This ensures socket.data.userId is always set from the verified token.
    callNamespace.use(async (socket, next) => {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.query?.token;

        if (!token) {
            console.warn("[CallSocket] Connection rejected: missing token");
            return next(new Error("Missing token"));
        }

        try {
            const { id } = verifyJWT(token as string);
            socket.data.userId = id;
            next();
        } catch {
            console.warn("[CallSocket] Connection rejected: invalid token");
            next(new Error("Invalid token"));
        }
    });

    callNamespace.on("connection", (socket: Socket) => {
        // userId is set by auth middleware via socket.data.userId (verified JWT).
        // The local mutable `userId` allows handlers like 'register' to override it.
        let userId: string = socket.data.userId;

        // Register user identity
        socket.on("register", (id: string) => {
            userId = id;
            socket.join(userId);
            socket.data.userId = userId;
            console.log(`[CallSocket] User ${userId} registered/connected`);
        });

        // If client joins room manually
        socket.on("join_room", (room: string) => {
            socket.join(room);
            if (!userId) {
                userId = room;
                socket.data.userId = userId;
            }
        });

        console.log(`[CallSocket] Client connected: ${socket.id}`);

        // ─── Call User ───
        socket.on("call_user", ({ toUserIds, callType, callId }: { toUserIds: string[], callType: "audio" | "video", callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            console.log(`[CallSocket] call_user from ${fromUserId} to ${toUserIds}`);

            if (!fromUserId) return;

            // Store call with participant tracking
            activeCalls.set(callId, {
                callerId: fromUserId,
                recipients: toUserIds,
                callType,
                isGroupCall: toUserIds.length > 1,
                timestamp: Date.now(),
                status: "ringing",
                participants: new Set<string>(),
            });

            // 1. Emit to Sender (Call Initiated)
            socket.emit("call_initiated", { callId, recipients: toUserIds, callType });

            // 2. Bridge to /chat namespace to notify recipients
            io.of("/chat").to(toUserIds).emit("notification", {
                type: "incoming_call",
                callId,
                callType,
                fromUserId,
                timestamp: Date.now()
            });
            console.log(`[CallSocket] Bridged notification to /chat for ${toUserIds}`);
        });

        // ─── Join Call (User opens call tab) ───
        socket.on("join_call", ({ callId, userId: id }: { callId: string, userId: string }) => {
            userId = id;
            socket.data.userId = id;
            socket.join(id);      // Join their own room (for targeted signaling)
            socket.join(callId);  // Join call room

            // Track socket → call mapping for disconnect cleanup
            socketToCall.set(socket.id, { callId, userId: id });

            const call = activeCalls.get(callId);
            if (call) {
                // Add to participants
                call.participants.add(id);
                const participantList = Array.from(call.participants);
                const isGroupCall = call.isGroupCall;

                console.log(`[CallSocket] User ${id} joined call ${callId} | Participants: ${participantList.length} | Group: ${isGroupCall}`);

                // Notify ALL users in the room (including the joiner) about current participants
                callNamespace.to(callId).emit("participant_joined", {
                    userId: id,
                    participants: participantList,
                    isGroupCall,
                });

                // Also tell the joining user who's already there (so they can create peer connections)
                socket.emit("existing_participants", {
                    participants: participantList.filter(p => p !== id),
                    isGroupCall,
                });
            }
        });

        // ─── Call Answered (Explicit Signal) ───
        socket.on("call_answered", ({ callId }: { callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            console.log(`[CallSocket] call_answered by ${fromUserId}`);

            const call = activeCalls.get(callId);
            if (call) {
                call.status = "answered";
                activeCalls.set(callId, call);

                // Notify everyone in the call
                callNamespace.to(callId).emit("call_answered", { fromUserId, callId });
            }
        });

        // ─── WebRTC Signals ───
        socket.on("webrtc_offer", ({ toUserIds, sdp, callId }: { toUserIds: string[], sdp: any, callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            toUserIds.forEach(toId => {
                callNamespace.to(toId).emit("webrtc_offer", { fromUserId, sdp, callId });
            });
        });

        socket.on("webrtc_answer", ({ toUserIds, sdp, callId }: { toUserIds: string[], sdp: any, callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            toUserIds.forEach(toId => {
                callNamespace.to(toId).emit("webrtc_answer", { fromUserId, sdp, callId });
            });
        });

        socket.on("webrtc_ice_candidate", ({ toUserIds, candidate }: { toUserIds: string[], candidate: any }) => {
            const fromUserId = socket.data.userId || userId;
            toUserIds.forEach(toId => {
                callNamespace.to(toId).emit("webrtc_ice_candidate", { fromUserId, candidate });
            });
        });

        socket.on("camera_toggled", ({ callId, isCameraOff }: { callId: string, isCameraOff: boolean }) => {
            const fromUserId = socket.data.userId || userId;
            socket.to(callId).emit("camera_toggled", { userId: fromUserId, isCameraOff });
        });

        // ─── Mute toggle broadcast ───
        socket.on("mute_toggled", ({ callId, isMuted }: { callId: string, isMuted: boolean }) => {
            const fromUserId = socket.data.userId || userId;
            socket.to(callId).emit("mute_toggled", { userId: fromUserId, isMuted });
        });

        // ─── Leave Call (User leaves but call continues for others) ───
        socket.on("leave_call", ({ callId }: { callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            handleUserLeaveCall(socket, callNamespace, io, fromUserId, callId);
        });

        // ─── End Call (Legacy: ends the entire call for everyone) ───
        socket.on("call_ended", ({ callId }: { callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            const call = activeCalls.get(callId);
            if (call) {
                activeCalls.delete(callId);
                // Clean up all socket mappings for this call
                for (const [sid, info] of socketToCall.entries()) {
                    if (info.callId === callId) socketToCall.delete(sid);
                }

                // Notify everyone in the call room
                callNamespace.to(callId).emit("call_ended", { fromUserId, callId });

                // Also notify via chat
                io.of("/chat").to(call.recipients).emit("notification", {
                    type: "call_ended",
                    callId
                });
            }
        });

        socket.on("call_rejected", ({ callId }: { callId: string }) => {
            // Rejection handled from chat socket bridge
        });

        // ─── Disconnect ───
        socket.on("disconnect", () => {
            const fromUserId = socket.data.userId || userId;
            console.log(`[CallSocket] Disconnected: ${fromUserId} (socket: ${socket.id})`);

            // Look up which call this socket was in
            const callInfo = socketToCall.get(socket.id);
            if (callInfo) {
                handleUserLeaveCall(socket, callNamespace, io, callInfo.userId, callInfo.callId);
                socketToCall.delete(socket.id);
            }
        });
    });
}

/**
 * Handle a user leaving a call (either voluntarily or via disconnect).
 * If other participants remain, the call continues. If no one is left, the call is cleaned up.
 */
function handleUserLeaveCall(
    socket: Socket,
    callNamespace: any,
    io: Server,
    userId: string,
    callId: string
) {
    const call = activeCalls.get(callId);
    if (!call) return;

    // Remove from participants
    call.participants.delete(userId);
    socket.leave(callId);

    const participantList = Array.from(call.participants);
    const isGroupCall = call.isGroupCall;

    console.log(`[CallSocket] User ${userId} left call ${callId} | Remaining: ${participantList.length}`);

    if (participantList.length === 0) {
        // No one left — clean up the call entirely
        activeCalls.delete(callId);

        // Clean up socket mappings
        for (const [sid, info] of socketToCall.entries()) {
            if (info.callId === callId) socketToCall.delete(sid);
        }

        // Notify chat about call ending
        io.of("/chat").to(call.recipients).emit("notification", {
            type: "call_ended",
            callId,
        });
    } else if (participantList.length === 1) {
        // Only one person left — end the call for them too
        callNamespace.to(callId).emit("call_ended", {
            fromUserId: userId,
            callId,
            reason: "last_participant",
        });

        activeCalls.delete(callId);
        for (const [sid, info] of socketToCall.entries()) {
            if (info.callId === callId) socketToCall.delete(sid);
        }

        io.of("/chat").to(call.recipients).emit("notification", {
            type: "call_ended",
            callId,
        });
    } else {
        // Others still in the call — notify them
        callNamespace.to(callId).emit("participant_left", {
            userId,
            participants: participantList,
            isGroupCall,
        });
    }
}