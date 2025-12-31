'use client';

import { useCall } from '@/context/CallContext';
import CallControls from './CallControls';
import VideoGrid from './VideoGrid';

export default function CallOverlay() {
    const {
        callState,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
    } = useCall();

    if (callState.callStatus === 'idle') return null;

    const isRinging = callState.callStatus === 'ringing';
    const isConnected = callState.callStatus === 'connected';

    // If it's an incoming call (ringing and we have a caller set), don't show overlay
    // Let the IncomingCallPopup handle the UI
    if (isRinging && callState.caller) return null;

    if (!isRinging && !isConnected) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    console.log("oooooooooooooooooooooooooooooo", callState)

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/80 to-transparent text-white pointer-events-none">
                <div className="flex flex-col items-center">
                    <div className="text-lg font-semibold drop-shadow-md">
                        {isRinging ? 'Calling...' : (callState.callType === 'video' ? 'Video Call' : 'Audio Call')}
                    </div>
                    <div className="text-sm text-gray-300 drop-shadow-sm flex gap-2">
                        {isConnected && <span>{formatTime(callState.callDuration)}</span>}
                        {callState.isMuted && <span>• Muted</span>}
                    </div>
                </div>
            </div>

            {/* Video/Audio Area */}
            <div className="flex-1 relative overflow-hidden">
                <VideoGrid
                    localStream={callState.localStream}
                    remoteStreams={callState.remoteStreams}
                    isCameraOff={callState.isCameraOff}
                    callType={callState.callType}
                />
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-black/80 to-transparent flex justify-center pointer-events-auto">
                <CallControls
                    callType={callState.callType}
                    isMuted={callState.isMuted}
                    isCameraOff={callState.isCameraOff}
                    isScreenSharing={callState.isScreenSharing}
                    onToggleMute={toggleMute}
                    onToggleCamera={toggleCamera}
                    onToggleScreenShare={toggleScreenShare}
                    onEndCall={endCall}
                />

            </div>
        </div>
    );
}
