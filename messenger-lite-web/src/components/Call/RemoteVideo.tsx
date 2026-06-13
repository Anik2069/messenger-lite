'use client';
import React, { useEffect, useRef, useState } from "react";
import { getCallSocket } from "@/lib/callSocket";

interface RemoteVideoProps {
    stream: MediaStream;
    userId: string;
}

export const RemoteVideo = React.memo(function RemoteVideo({ stream, userId }: RemoteVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraOff, setIsCameraOff] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            setIsCameraOff(!videoTrack.enabled || videoTrack.muted);

            // Backup handling for browsers that do emit mute
            const handleMute = () => setIsCameraOff(true);
            const handleUnmute = () => setIsCameraOff(false);

            videoTrack.addEventListener('mute', handleMute);
            videoTrack.addEventListener('unmute', handleUnmute);

            return () => {
                videoTrack.removeEventListener('mute', handleMute);
                videoTrack.removeEventListener('unmute', handleUnmute);
            };
        } else {
            setIsCameraOff(true);
        }
    }, [stream]);

    useEffect(() => {
        const socket = getCallSocket();

        const handleCameraToggled = (data: { userId: string, isCameraOff: boolean }) => {
            if (data.userId === userId) {
                setIsCameraOff(data.isCameraOff);
            }
        };

        socket.on("camera_toggled", handleCameraToggled);

        return () => {
            socket.off("camera_toggled", handleCameraToggled);
        };
    }, [userId]);

    return (
        <div className="relative w-full h-full">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-center p-3 ${isCameraOff ? 'hidden' : ''}`}
            />
            {isCameraOff && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center  bg-gray-800">
                    <span className="text-sm text-white">Camera Off</span>
                </div>
            )}
        </div>
    );
});