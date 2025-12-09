"use client";
import { createContext, useContext, useRef, useState } from "react";

type CallType = "audio" | "video";
interface CallContextType {
    inCall: boolean;
    callType: CallType | null;
    receivingCall: boolean;
    callerId: string | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);


export const CallProvider = ({ children }: { children: React.ReactNode }) => {

    const [inCall, setInCall] = useState(false);
    const [callType, setCallType] = useState<CallType | null>(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [callerId, setCallerId] = useState<string | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    const startCall = async (toUserIds: string | string[], callType: CallType) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video"
        })
        setLocalStream(stream)
        setCallType(callType)
        setInCall(true)
    }
    const endCall = () => {

    }
    return (
        <CallContext.Provider value={{
            inCall,
            callType,
            receivingCall,
            callerId,
            localStream,
            remoteStream
        }}>
            {children}
        </CallContext.Provider>
    )
}

export const useCallContext = () => {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error("useCallContext must be used within a CallContextProvider");
    }
    return context;
}