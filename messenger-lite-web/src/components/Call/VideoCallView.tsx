"use client"
import { useCall } from "@/context/CallContext";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Mic, MicOff, PhoneOff, ScreenShare, Video, VideoOff } from "lucide-react";
import { RemoteVideo } from "./RemoteVideo";

export const VideoCallView = ({ callId }: { callId: string }) => {
    const {
        callState,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
    } = useCall();

    const { localStream, remoteStreams, isMuted, isCameraOff, isScreenSharing, callStatus, endReason } = callState;
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
                <h2 className="text-xl font-semibold drop-shadow-md">
                    {callStatus === 'ringing' ? 'Ringing...' :
                        callStatus === 'connecting' ? 'Connecting...' :
                            callStatus === 'connected' ? 'Connected' :
                                callStatus === 'ended' ? 'Call Ended' : 'Calling...'}
                </h2>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                {/* Remote Streams Grid */}
                <div className="flex flex-wrap items-center justify-center w-full h-full gap-4 p-4">
                    {Object.entries(remoteStreams).length === 0 && callStatus === 'connected' && (
                        <div className="text-gray-400">Waiting for others to join...</div>
                    )}

                    {callStatus === 'ended' && (
                        <div className="flex flex-col items-center text-center bg-gray-900/80 p-8 rounded-2xl border border-gray-700 backdrop-blur-md z-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <h3 className="text-2xl font-bold text-white mb-2">Disconnected</h3>
                            <p className="text-gray-400 text-sm">
                                {endReason === 'network_unstable' ? 'The network is unstable.' :
                                 endReason === 'rejected' ? 'The call was rejected.' :
                                 'The user left.'}
                            </p>
                        </div>
                    )}

                    {Object.entries(remoteStreams).map(([userId, stream]) => (
                        <RemoteVideo key={userId} stream={stream} userId={userId} />
                    ))}
                </div>

                {/* Local Video (PiP) */}
                <div className="absolute bottom-24 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border border-gray-700 shadow-lg transition-all duration-300">
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
            <div className="h-24 bg-gradient-to-t from-gray-900 to-transparent flex items-center justify-center gap-6 pb-6">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                    variant={isCameraOff ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
                    onClick={toggleCamera}
                >
                    {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>

                <Button
                    variant={isScreenSharing ? "default" : "secondary"}
                    size="icon"
                    className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
                    onClick={toggleScreenShare}
                >
                    <ScreenShare className="w-6 h-6" />
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-16 h-16 shadow-lg hover:scale-110 transition-transform bg-red-600 hover:bg-red-700"
                    onClick={endCall}
                >
                    <PhoneOff className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
};
