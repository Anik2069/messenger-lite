import { Server, Socket } from "socket.io";
// import emitToRecipients from "../helpers/socketEmit.helper";

// Store active calls in memory (scoped to this module/namespace)
const activeCalls = new Map<string, {
    callerId: string;
    recipients: string[];
    callType: "audio" | "video";
    timestamp: number;
    status: "ringing" | "answered" | "ended";
}>();

// Helper to get socket IDs for a user in the /call namespace
const getSocketIds = (io: any, userId: string) => {
    // In the /call namespace, we join the room named after the userId
    // so emitting to `userId` should work if we joined it.
    return [userId];
};

export function initCallSocket(io: Server) {
    const callNamespace = io.of("/call");

    callNamespace.on("connection", (socket: Socket) => {
        // Authenticate (Basic check - in prod reuse middleware)
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            console.log("Call socket missing token");
            // socket.disconnect(); // strict
            // return; 
        }

        // We assume the client sends userId in handshake or we decode token
        // For consistency with existing initSocket, let's trust the client sends userId or we decoded it.
        // But since we are separating, we should ideally reuse the auth middleware.
        // For now, let's grab it from handshake auth if available, or rely on the client joining 'join_call_room'
        // But the previous implementation had `socket.data.userId` set by middleware.
        // We really should attach middleware to this namespace too.

        // FIXME: We need userId. Let's assume it's passed or we use the middleware from initSocket if it was global.
        // Since we are decoupling, let's assume valid connection means we have userId from the handshake auth.
        // Ideally we'd verifyJWT here too.

        let userId = socket.handshake.auth?.userId;
        if (!userId) {
            // Fallback: try to decode token if needed, or wait for a 'join' event.
            // But existing logic heavily relies on socket.data.userId
        }

        // Just for safety if we don't have middleware here yet:
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
                userId = room; // Assume first join is userId room
                socket.data.userId = userId;
            }
        });

        console.log(`[CallSocket] Client connected: ${socket.id}`);

        // Call User
        socket.on("call_user", ({ toUserIds, callType, callId }: { toUserIds: string[], callType: "audio" | "video", callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            console.log(`[CallSocket] call_user from ${fromUserId} to ${toUserIds}  ----------------------------------------`);

            if (!fromUserId) return;

            // Store call
            activeCalls.set(callId, {
                callerId: fromUserId,
                recipients: toUserIds,
                callType,
                timestamp: Date.now(),
                status: "ringing"
            });

            // 1. Emit to Sender (Call Initiated)
            socket.emit("call_initiated", { callId, recipients: toUserIds, callType });

            // 2. We CANNOT emit 'call_received' to recipients here because they are NOT connected to /call yet!
            // We must bridge to the /chat namespace to notify them.
            // Since we don't have direct access to the /chat io instance easily unless we pass it or import it.
            // Using `io.of('/chat')` works if io is the main server instance.

            io.of("/chat").to(toUserIds).emit("notification", {
                type: "incoming_call",
                callId,
                callType,
                fromUserId,
                timestamp: Date.now()
            });
            console.log(`[CallSocket] Bridged notification to /chat for ${toUserIds}`);
        });

        // Join Call (New tab opened)
        socket.on("join_call", ({ callId, userId: id }: { callId: string, userId: string }) => {
            // This is confirmed user joining the call (opening the tab)
            userId = id;
            socket.data.userId = id;
            socket.join(id); // Join their own room
            socket.join(callId); // Join call room
            console.log(`[CallSocket] User ${id} joined call ${callId}`);

            const call = activeCalls.get(callId);
            if (call) {
                // If this is a recipient joining, it means they "Answered" implicitly by opening the link?
                // Or they are just ready. The UI will trigger "call_answered" explicitly or implicit?
                // Requirements say: "Accept opens new tab".
                // So if they are here, they accepted.

                // NOTIFY others in the call room
                socket.to(callId).emit("user_joined_call", { userId: id });
            }
        });

        // Call Answered (Explicit Signal)
        socket.on("call_answered", ({ callId }: { callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            console.log(`[CallSocket] call_answered by ${fromUserId}`);

            const call = activeCalls.get(callId);
            if (call) {
                call.status = "answered";
                activeCalls.set(callId, call);

                // Notify everyone in the call (caller is already there)
                // Emit to the CALL ID room
                callNamespace.to(callId).emit("call_answered", { fromUserId, callId });
            }
        });

        // WebRTC Signals (Offer, Answer, ICE)
        // Forwarding logic: Sender sends to specific user OR to room.
        // Usually WebRTC is P2P so we target specific user.

        socket.on("webrtc_offer", ({ toUserIds, sdp, callId }: { toUserIds: string[], sdp: any, callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            // Emit to specific users in /call namespace
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

        // End Call / Reject
        socket.on("call_ended", ({ callId }: { callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            const call = activeCalls.get(callId);
            if (call) {
                activeCalls.delete(callId);
                // Notify everyone in the call room
                callNamespace.to(callId).emit("call_ended", { fromUserId, callId });

                // Also could notify disjoint recipients if they haven't joined yet via chat?
                // For now, assume if they haven't joined, they miss it.
                // Or we can send a 'call_ended' notification to chat too to close the popup.
                io.of("/chat").to(call.recipients).emit("notification", {
                    type: "call_ended",
                    callId
                });
            }
        });

        socket.on("call_rejected", ({ callId }: { callId: string }) => {
            const fromUserId = socket.data.userId || userId;
            // Notify caller via Chat (since they are waiting in chat tab? No, caller opens tab immediately)
            // Caller IS in /call namespace.
            // If Callee rejects from Popup (Chat Tab) -> They emit to Chat Socket -> Chat Socket forwards to Call Namespace?
            // OR Callee opens tab just to reject? No, "Accept opens new tab".
            // So Rejection happens in Chat Tab. 
            // We need `call_rejected` handler in CHAT socket that forwards to CALL socket.
        });

        socket.on("disconnect", () => {
            const fromUserId = socket.data.userId || userId;
            console.log(`[CallSocket] Disconnected: ${fromUserId}`);
            // Handle cleanup if user was in active call
            // Simple approach: if user disconnects, emit 'call_ended' or 'peer_disconnected' to their active calls
        });
    });
}