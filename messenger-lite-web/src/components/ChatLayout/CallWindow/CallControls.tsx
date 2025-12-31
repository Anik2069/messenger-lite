// components/call/CallControls.tsx
'use client';

import { PhoneOff, Video, VideoOff, Mic, MicOff, MonitorUp, MonitorOff } from 'lucide-react';

interface CallControlsProps {
    callType: 'audio' | 'video';
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
    onToggleMute: () => void;
    onToggleCamera: () => void;
    onToggleScreenShare: () => void;
    onEndCall: () => void;
}

export default function CallControls({
    callType,
    isMuted,
    isCameraOff,
    isScreenSharing,
    onToggleMute,
    onToggleCamera,
    onToggleScreenShare,
    onEndCall,
}: CallControlsProps) {
    return (
        <div className="flex justify-center items-center gap-4">
            {/* Mute Toggle */}
            <button
                onClick={onToggleMute}
                className={`rounded-full w-14 h-14 flex items-center justify-center transition-all ${isMuted
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? (
                    <MicOff className="w-6 h-6" />
                ) : (
                    <Mic className="w-6 h-6" />
                )}
            </button>

            {/* Camera Toggle (video calls only) */}
            {callType === 'video' && (
                <button
                    onClick={onToggleCamera}
                    className={`rounded-full w-14 h-14 flex items-center justify-center transition-all ${isCameraOff
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                    aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
                >
                    {isCameraOff ? (
                        <VideoOff className="w-6 h-6" />
                    ) : (
                        <Video className="w-6 h-6" />
                    )}
                </button>
            )}

            {/* Screen Share (video calls only) */}
            {callType === 'video' && (
                <button
                    onClick={onToggleScreenShare}
                    className={`rounded-full w-14 h-14 flex items-center justify-center transition-all ${isScreenSharing
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                    aria-label={isScreenSharing ? "Stop screen sharing" : "Share screen"}
                >
                    {isScreenSharing ? (
                        <MonitorOff className="w-6 h-6" />
                    ) : (
                        <MonitorUp className="w-6 h-6" />
                    )}
                </button>
            )}

            {/* End Call */}
            <button
                onClick={onEndCall}
                className="rounded-full w-16 h-16 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors"
                aria-label="End call"
            >
                <PhoneOff className="w-7 h-7" />
            </button>
        </div>
    );
}