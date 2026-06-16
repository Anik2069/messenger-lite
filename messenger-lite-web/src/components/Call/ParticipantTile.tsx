'use client';
import React, { useEffect, useRef, useState } from "react";
import { getCallSocket } from "@/lib/callSocket";
import { MicOff, User } from "lucide-react";
import LiveVoiceVisualizer from "../reusable/LiveVoiceVisualizer";

interface ParticipantTileProps {
    stream: MediaStream | null;
    userId: string;
    isLocal?: boolean;
    isMuted?: boolean;
    isCameraOff?: boolean;
    variant: 'video' | 'audio';
    /** Display name for the participant */
    displayName?: string;
}

export const ParticipantTile = React.memo(function ParticipantTile({
    stream,
    userId,
    isLocal = false,
    isMuted = false,
    isCameraOff: propCameraOff = false,
    variant,
    displayName,
}: ParticipantTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCameraOff, setIsCameraOff] = useState(propCameraOff);

    // Sync prop changes
    useEffect(() => {
        setIsCameraOff(propCameraOff);
    }, [propCameraOff]);

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }

        if (variant === 'video' && stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                setIsCameraOff(!videoTrack.enabled || videoTrack.muted);

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
        }
    }, [stream, variant]);

    // Listen for remote camera toggle via socket (for non-local)
    useEffect(() => {
        if (isLocal) return;
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
    }, [userId, isLocal]);

    const name = displayName || (isLocal ? 'You' : `User ${userId.slice(0, 6)}`);

    // ─── VIDEO VARIANT ───
    if (variant === 'video') {
        return (
            <div className="participant-tile participant-tile--video">
                {/* Video */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted={isLocal}
                    playsInline
                    className={`participant-tile__video ${isCameraOff ? 'participant-tile__video--hidden' : ''}`}
                />

                {/* Camera off fallback */}
                {isCameraOff && (
                    <div className="participant-tile__avatar-fallback">
                        <div className="participant-tile__avatar-circle">
                            <User className="participant-tile__avatar-icon" />
                        </div>
                    </div>
                )}

                {/* Bottom overlay with name and status */}
                <div className="participant-tile__overlay">
                    <div className="participant-tile__info">
                        <span className="participant-tile__name">{name}</span>
                        {isMuted && (
                            <MicOff className="participant-tile__mute-icon" />
                        )}
                    </div>
                </div>

                {/* Local badge */}
                {isLocal && (
                    <div className="participant-tile__local-badge">You</div>
                )}
            </div>
        );
    }

    // ─── AUDIO VARIANT ───
    return (
        <div className="participant-tile participant-tile--audio">
            <div className="participant-tile__audio-content">
                {/* Avatar */}
                <div className="participant-tile__audio-avatar-wrap">
                    <div className={`participant-tile__audio-avatar ${!isMuted && stream ? 'participant-tile__audio-avatar--speaking' : ''}`}>
                        <User className="participant-tile__audio-avatar-icon" />
                    </div>
                </div>

                {/* Name and visualizer */}
                <div className="participant-tile__audio-info">
                    <span className="participant-tile__audio-name">{name}</span>

                    {/* Voice visualizer or mute indicator */}
                    <div className="participant-tile__audio-visualizer">
                        {isMuted ? (
                            <div className="participant-tile__muted-label">
                                <MicOff size={14} />
                                <span>Muted</span>
                            </div>
                        ) : stream ? (
                            <LiveVoiceVisualizer
                                stream={stream}
                                type="chat"
                                height={32}
                                waveColor="#8b7355"
                                barWidth={2.5}
                                barGap={1.5}
                            />
                        ) : (
                            <div className="participant-tile__muted-label">
                                <span>Connecting...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status indicators */}
            <div className="participant-tile__audio-status">
                {isMuted && <MicOff size={14} className="participant-tile__status-icon participant-tile__status-icon--muted" />}
            </div>
        </div>
    );
});
