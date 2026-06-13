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

    const { localStream, remoteStreams, isMuted, isCameraOff, isScreenSharing, callStatus, endReason, callDuration } = callState;
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
                <h2 className="text-xm font-semibold drop-shadow-md">
                    {callStatus === 'ringing' ? 'Ringing...' :
                        callStatus === 'connecting' ? 'Connecting...' :
                            callStatus === 'connected' ? '' :
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
                        <div className="relative bg-black overflow-hidden w-full aspect-video shadow-md h-full">
                            <RemoteVideo key={userId} stream={stream} userId={userId} />
                        </div>
                    ))}
                </div>

                {/* Local Video (PiP) */}
                <div className="absolute top-6 right-6 w-32 h-24 md:w-40 md:h-32 lg:w-48 lg:h-32 bg-black  overflow-hidden border border-gray-700  transition-all duration-300 z-30">
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
            <div className="h-32 bg-gradient-to-t from-gray-900 to-transparent flex flex-col items-center justify-end gap-4 pb-6 z-40">
                {callStatus === 'connected' && (
                    <div className="text-gray-300 text-sm font-mono bg-black/50 px-4 py-1 rounded-full border border-gray-700">
                        {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                    </div>
                )}
                <div className="flex items-center justify-center gap-6">
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

                    {/* <Button
                    variant={isScreenSharing ? "default" : "secondary"}
                    size="icon"
                    className="rounded-full w-14 h-14 shadow-lg hover:scale-105 transition-transform"
                    onClick={toggleScreenShare}
                >
                    <ScreenShare className="w-6 h-6" />
                </Button> */}

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
        </div>
    );
};
