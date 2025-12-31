'use client';
import React, { useEffect, useRef } from "react";

interface RemoteVideoProps {
    stream: MediaStream;
    userId: string;
}

export const RemoteVideo = React.memo(function RemoteVideo({ stream, userId }: RemoteVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-2xl aspect-video shadow-md">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                {userId}
            </div>
        </div>
    );
});