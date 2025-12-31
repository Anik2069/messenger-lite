"use client"
import { CALL_SECRET } from "@/constant";
import { useCall } from "@/context/CallContext";
import { base64UrlDecode } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Mic, MicOff, PhoneOff, ScreenShare, Video, VideoOff } from "lucide-react";
import { RemoteVideo } from "./RemoteVideo";

const secretKey = CALL_SECRET;
const CallInterface = ({ callId }: { callId: string }) => {
    const {
        callState,
        startCall,
        answerCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
        setLocalStream
    } = useCall();

    const searchParams = useSearchParams();


    const payload = (searchParams.get('payload') as string);
    // console.log(payload, "payload")

    // Determine if we are initiating or joining
    // If 'to' is present, we are likely the caller initiating the call to these users.
    // If 'to' is NOT present, we might be joining an existing call link (e.g. from invite).
    // But our ChatHeader logic sends ?type=...&to=... for the caller.
    // The Recipient popup Logic logic will simple open /call/callId.

    // On Mount
    useEffect(() => {


        const { callId: payloadCallId,
            type,
            toUserIds,
            token,
            CALL_SECRET } = base64UrlDecode(payload);

        // console.log(payloadCallId, "payloadCallId", type, "type", toUserIds, "toUserIds", token, "token", CALL_SECRET, "CALL_SECRET")

        if (!payloadCallId || !type || !toUserIds || !token || !CALL_SECRET) {
            endCall();
            return;
        }

        if (callId !== payloadCallId) {
            endCall();
            return;
        }

        if (CALL_SECRET !== secretKey) {
            endCall();
            return;
        }

        // Prevent double init
        if (callState.callId === callId && (callState.callStatus === 'ringing' || callState.callStatus === 'connected')) {
            return;
        }

        if (toUserIds.length > 0) {
            // We are the caller
            console.log('We are the caller', toUserIds, type, callId);
            startCall(toUserIds, type, callId);
        } else {
            // We are joining (Callee)
            // We need 'type' to init media? 
            // If query param 'type' is missing, we might assume audio or fetch from socket?
            // Ideally the notification link should include type.
            // Assuming we join with same type as requested.
            answerCall(callId, type);
        }
    }, [callId, payload, startCall, answerCall]);

    const { localStream, remoteStreams, isMuted, isCameraOff, isScreenSharing, callStatus } = callState;
    // console.log(localStream, "localStream", remoteStreams, "remoteStreams", isMuted, "isMuted", isCameraOff, "isCameraOff", isScreenSharing, "isScreenSharing", callStatus, "callStatus")
    // Video Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header / Info */}
            <div className="absolute top-0 w-full p-4 z-10 bg-transparent text-center">
                <h2 className="text-xl font-semibold">
                    {callStatus === 'ringing' ? 'Calling...' :
                        callStatus === 'connected' ? 'Connected' :
                            callStatus === 'ended' ? 'Call Ended' : 'Connecting...'}
                </h2>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {/* Remote Streams Grid */}
                <div className="flex flex-wrap items-center justify-center w-full h-full gap-4 p-4">
                    {Object.entries(remoteStreams).length === 0 && callStatus === 'connected' && (
                        <div className="text-gray-400">Waiting for others to join...</div>
                    )}

                    {Object.entries(remoteStreams).map(([userId, stream]) => (
                        <RemoteVideo key={userId} stream={stream} userId={userId} />
                    ))}
                </div>

                {/* Local Video (PiP) */}
                <div className="absolute bottom-24 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : ''}`}
                    />
                    {isCameraOff && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <span className="text-sm">Camera Off</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="h-20 bg-gray-800 flex items-center justify-center gap-4 pb-4">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>

                <Button
                    variant={isCameraOff ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleCamera}
                >
                    {isCameraOff ? <VideoOff /> : <Video />}
                </Button>

                <Button
                    variant={isScreenSharing ? "default" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={toggleScreenShare}
                >
                    <ScreenShare />
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-14 h-14"
                    onClick={endCall}
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}

export default CallInterface
