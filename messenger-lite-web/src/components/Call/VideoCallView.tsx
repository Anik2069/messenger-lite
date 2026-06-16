"use client"
import { useCall } from "@/context/CallContext";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Users } from "lucide-react";
import { RemoteVideo } from "./RemoteVideo";
import { GroupVideoGrid } from "./GroupVideoGrid";

export const VideoCallView = ({ callId }: { callId: string }) => {
    const {
        callState,
        endCall,
        leaveCall,
        toggleMute,
        toggleCamera,
    } = useCall();

    const { localStream, remoteStreams, isMuted, isCameraOff, callStatus, endReason, callDuration, isGroupCall, participantIds } = callState;
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const handleEndCall = () => {
        if (isGroupCall) {
            leaveCall(); // Graceful leave — call continues for others
        } else {
            endCall(); // 1-to-1 — end for everyone
        }
    };

    return (
        <div className="video-call-view">
            {/* Header / Info */}
            <div className="video-call-view__header">
                <h2 className="video-call-view__status-text">
                    {callStatus === 'ringing' ? 'Ringing...' :
                        callStatus === 'connecting' ? 'Connecting...' :
                            callStatus === 'connected' ? '' :
                                callStatus === 'ended' ? 'Call Ended' : 'Calling...'}
                </h2>
                {isGroupCall && callStatus === 'connected' && (
                    <div className="video-call-view__participant-count">
                        <Users size={14} />
                        <span>{participantIds.length} participants</span>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="video-call-view__main">
                {isGroupCall ? (
                    /* ─── GROUP CALL: Grid layout ─── */
                    <GroupVideoGrid callId={callId} />
                ) : (
                    /* ─── 1-TO-1 CALL: Original layout ─── */
                    <div className="video-call-view__one-to-one">
                        {/* Remote Streams */}
                        <div className="video-call-view__remote-area">
                            {Object.entries(remoteStreams).length === 0 && callStatus === 'connected' && (
                                <div className="video-call-view__waiting">Waiting for others to join...</div>
                            )}

                            {Object.entries(remoteStreams).map(([userId, stream]) => (
                                <div className="video-call-view__remote-stream" key={userId}>
                                    <RemoteVideo stream={stream} userId={userId} />
                                </div>
                            ))}
                        </div>

                        {/* Local Video (PiP) */}
                        <div className="video-call-view__local-pip">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className={`video-call-view__local-video ${isCameraOff ? 'video-call-view__local-video--hidden' : ''}`}
                            />
                            {isCameraOff && (
                                <div className="video-call-view__local-camera-off">
                                    <span>Camera Off</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Ended overlay */}
                {callStatus === 'ended' && (
                    <div className="video-call-view__ended-overlay">
                        <h3 className="video-call-view__ended-title">Disconnected</h3>
                        <p className="video-call-view__ended-reason">
                            {endReason === 'network_unstable' ? 'The network is unstable.' :
                                endReason === 'rejected' ? 'The call was rejected.' :
                                    endReason === 'last_participant' ? 'Everyone else left.' :
                                        'The user left.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="video-call-view__controls">
                {callStatus === 'connected' && (
                    <div className="video-call-view__timer">
                        {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
                    </div>
                )}
                {callStatus !== 'ended' && (
                    <div className="video-call-view__buttons">
                        <Button
                            variant={isMuted ? "destructive" : "secondary"}
                            size="icon"
                            className="video-call-view__btn video-call-view__btn--toggle"
                            onClick={toggleMute}
                        >
                            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </Button>

                        <Button
                            variant={isCameraOff ? "destructive" : "secondary"}
                            size="icon"
                            className="video-call-view__btn video-call-view__btn--toggle"
                            onClick={toggleCamera}
                        >
                            {isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                        </Button>

                        <Button
                            variant="destructive"
                            size="icon"
                            className="video-call-view__btn video-call-view__btn--end"
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
