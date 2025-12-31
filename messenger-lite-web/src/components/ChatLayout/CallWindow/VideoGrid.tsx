// components/call/VideoGrid.tsx
'use client';

import { VideoOff, User } from 'lucide-react';
import React from 'react';

interface VideoGridProps {
    localStream: MediaStream | null;
    remoteStreams: Record<string, MediaStream>;
    isCameraOff: boolean;
    callType: 'audio' | 'video';
}

export default function VideoGrid({
    localStream,
    remoteStreams,
    isCameraOff,
    callType,
}: VideoGridProps) {
    const remoteStreamIds = Object.keys(remoteStreams);
    const hasRemote = remoteStreamIds.length > 0;

    // Calculate grid columns based on number of participants
    const getGridClass = (count: number) => {
        if (count <= 1) return 'grid-cols-1';
        if (count === 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        return 'grid-cols-3';
    };

    return (
        <div className="absolute inset-0 p-4">
            {/* Main video area */}
            <div className={`relative w-full h-full ${hasRemote ? 'grid gap-4 ' + getGridClass(remoteStreamIds.length) : 'flex items-center justify-center bg-gray-900 rounded-xl'}`}>

                {!hasRemote && (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${callType === 'video' ? 'bg-gray-800' : 'bg-blue-900'}`}>
                            <User className={`w-16 h-16 ${callType === 'video' ? 'text-gray-400' : 'text-blue-300'}`} />
                        </div>
                        <div className="text-white text-xl">
                            {callType === 'video' ? 'Waiting for participants...' : 'Audio Call'}
                        </div>
                        <div className="text-gray-400 mt-2">
                            {callType === 'video' ? 'Connecting your call' : 'Speak clearly into your microphone'}
                        </div>
                    </div>
                )}

                {remoteStreamIds.map((userId) => (
                    <div key={userId} className="relative rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
                        {/* Remote Video */}
                        <video
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            ref={(el) => {
                                if (el && remoteStreams[userId]) {
                                    el.srcObject = remoteStreams[userId];
                                }
                            }}
                        />
                        {/* User Label/Overlay could go here */}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            User {userId.substring(0, 4)}...
                        </div>
                    </div>
                ))}
            </div>

            {/* Local video (PiP) - Always show unless it's audio only without remote? No, show always for video call */}
            {callType === 'video' && localStream && (
                <div className={`absolute bottom-6 right-6 w-48 h-36 md:w-64 md:h-48 rounded-lg overflow-hidden border-2 border-white/20 bg-black shadow-2xl transition-all hover:scale-105 z-20`}>
                    {isCameraOff ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                            <VideoOff className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mb-2" />
                            <div className="text-white text-xs md:text-sm">Camera off</div>
                        </div>
                    ) : (
                        <video
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform -scale-x-100" // Mirror local video
                            ref={(el) => {
                                if (el && localStream) el.srcObject = localStream;
                            }}
                        />
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        You
                    </div>
                </div>
            )}
        </div>
    );
}