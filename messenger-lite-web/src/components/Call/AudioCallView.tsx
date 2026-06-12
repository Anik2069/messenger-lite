"use client"
import { useCall } from "@/context/CallContext";
import { Button } from "../ui/button";
import { Mic, MicOff, PhoneOff, User } from "lucide-react";
import { useEffect, useRef } from "react";
import LiveVoiceVisualizer from "../reusable/LiveVoiceVisualizer";

export const AudioCallView = ({ callId }: { callId: string }) => {
    const {
        callState,
        endCall,
        toggleMute,
    } = useCall();

    const { isMuted, callStatus, remoteStreams, localStream } = callState;
    const remoteAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Handle remote audio streams
    useEffect(() => {
        Object.entries(remoteStreams).forEach(([userId, stream]) => {
            if (!remoteAudioRefs.current[userId]) {
                const audio = new Audio();
                audio.autoplay = true;
                remoteAudioRefs.current[userId] = audio;
            }
            if (remoteAudioRefs.current[userId].srcObject !== stream) {
                remoteAudioRefs.current[userId].srcObject = stream;
            }
        });
    }, [remoteStreams]);

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-white relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            {/* Header / Info */}
            <div className="absolute top-0 w-full p-8 z-10 bg-transparent text-center">
                <h2 className="text-2xl font-semibold tracking-wide text-blue-100">
                    {callStatus === 'ringing' ? 'Ringing...' :
                        callStatus === 'connecting' ? 'Connecting...' :
                            callStatus === 'connected' ? 'Connected' :
                                callStatus === 'ended' ? 'Call Ended' : 'Calling...'}
                </h2>
                {callStatus === 'connected' && (
                    <p className="text-blue-200 mt-2 text-sm font-mono opacity-80">
                        Secure Audio Connection
                    </p>
                )}
            </div>

            {/* Main Content Area - Avatar Focus */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 gap-8">

                {/* Avatar container with ripple effect based on state */}
                <div className="relative flex items-center justify-center">
                    {callStatus === 'connected' && (
                        <>
                            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute inset-[-20px] border border-blue-500/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
                        </>
                    )}
                    <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] border-4 border-slate-800 z-10 relative">
                        <User className="w-20 h-20 text-white opacity-80" />
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">
                        {Object.keys(remoteStreams).length > 0 ? "In Call" : "Waiting for Answer"}
                    </h3>
                </div>

            </div>
            <div className="w-full max-w-xs md:max-w-md mx-auto h-[60px] flex items-center justify-center mb-8 transition-all duration-300">
                {!isMuted && localStream && (
                    <div className="w-full opacity-80">
                        <LiveVoiceVisualizer
                            stream={localStream}
                            type="chat"
                            height={50}
                            waveColor="#60a5fa"
                        />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="h-32 bg-gradient-to-t from-slate-950 to-transparent flex items-center justify-center gap-8 pb-8 z-10">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-16 h-16 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300"
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-20 h-20 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:scale-110 transition-all duration-300 bg-red-600 hover:bg-red-700"
                    onClick={endCall}
                >
                    <PhoneOff className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
};
