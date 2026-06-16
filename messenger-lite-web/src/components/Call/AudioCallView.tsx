"use client"
import { useCall } from "@/context/CallContext";
import { Button } from "../ui/button";
import { Mic, MicOff, PhoneOff, Users } from "lucide-react";
import { useEffect, useRef } from "react";
import LiveVoiceVisualizer from "../reusable/LiveVoiceVisualizer";
import { GroupAudioGrid } from "./GroupAudioGrid";
import { User } from "lucide-react";

export const AudioCallView = ({ callId }: { callId: string }) => {
    const {
        callState,
        endCall,
        leaveCall,
        toggleMute,
    } = useCall();

    const { isMuted, callStatus, remoteStreams, localStream, endReason, callDuration, isGroupCall, participantIds } = callState;
    const remoteAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Handle remote audio streams for 1-to-1 (group handled in GroupAudioGrid)
    useEffect(() => {
        if (isGroupCall) return;
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
    }, [remoteStreams, isGroupCall]);

    const handleEndCall = () => {
        if (isGroupCall) {
            leaveCall();
        } else {
            endCall();
        }
    };

    return (
        <div className="audio-call-view">
            {/* Background Glow Effect */}
            <div className="audio-call-view__bg-glow">
                <div className="audio-call-view__glow-orb"></div>
            </div>

            {/* Header / Info */}
            <div className="audio-call-view__header">
                <h2 className="audio-call-view__status-text">
                    {callStatus === 'ringing' ? 'Ringing...' :
                        callStatus === 'connecting' ? 'Connecting...' :
                            callStatus === 'connected' ? 'Connected' :
                                callStatus === 'ended' ? 'Call Ended' : 'Calling...'}
                </h2>
                {isGroupCall && callStatus === 'connected' && (
                    <div className="audio-call-view__participant-count">
                        <Users size={14} />
                        <span>{participantIds.length} participants</span>
                    </div>
                )}
                {callStatus === 'connected' && (
                    <p className="audio-call-view__subtitle">
                        Secure Audio Connection
                    </p>
                )}
            </div>

            {/* Main Content Area */}
            <div className="audio-call-view__main">
                {isGroupCall ? (
                    /* ─── GROUP CALL: Grid layout ─── */
                    <GroupAudioGrid callId={callId} />
                ) : (
                    /* ─── 1-TO-1 CALL: Original avatar layout ─── */
                    <>
                        {/* Avatar with ripple */}
                        <div className="audio-call-view__avatar-wrapper">
                            {callStatus === 'connected' && (
                                <>
                                    <div className="audio-call-view__avatar-ping"></div>
                                    <div className="audio-call-view__avatar-ring"></div>
                                </>
                            )}
                            <div className="audio-call-view__avatar">
                                <User className="audio-call-view__avatar-icon" />
                            </div>
                        </div>

                        <div className="audio-call-view__info-text">
                            <h3 className="audio-call-view__call-label">
                                {callStatus === 'ended'
                                    ? "Disconnected"
                                    : Object.keys(remoteStreams).length > 0
                                        ? "In Call"
                                        : "Waiting for Answer"}
                            </h3>
                            {callStatus === 'ended' && (
                                <p className="audio-call-view__end-reason">
                                    {endReason === 'network_unstable' ? 'The network is unstable.' :
                                        endReason === 'rejected' ? 'The call was rejected.' :
                                            endReason === 'last_participant' ? 'Everyone else left.' :
                                                'The user left.'}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Voice Visualizer (1-to-1 only) */}
            {!isGroupCall && (
                <div className="audio-call-view__visualizer-area">
                    {!isMuted && localStream && callStatus === 'connected' && (
                        <div className="audio-call-view__visualizer">
                            <LiveVoiceVisualizer
                                stream={localStream}
                                type="chat"
                                height={50}
                                waveColor="#60a5fa"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="audio-call-view__controls">
                {callStatus === 'connected' && (
                    <div className="audio-call-view__timer">
                        {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                    </div>
                )}
                {callStatus !== 'ended' && (
                    <div className="audio-call-view__buttons">
                        <Button
                            variant={isMuted ? "destructive" : "secondary"}
                            size="icon"
                            className="audio-call-view__btn audio-call-view__btn--toggle"
                            onClick={toggleMute}
                        >
                            {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                        </Button>

                        <Button
                            variant="destructive"
                            size="icon"
                            className="audio-call-view__btn audio-call-view__btn--end"
                            onClick={handleEndCall}
                        >
                            <PhoneOff className="w-8 h-8" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
