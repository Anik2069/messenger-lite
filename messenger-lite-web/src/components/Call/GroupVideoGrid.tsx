'use client';
import React from "react";
import { useCall } from "@/context/CallContext";
import { useAuth } from "@/context/useAuth";
import { ParticipantTile } from "./ParticipantTile";

interface GroupVideoGridProps {
    callId: string;
}

export const GroupVideoGrid = ({}: GroupVideoGridProps) => {
    const { callState } = useCall();
    const { user } = useAuth();
    const { remoteStreams, localStream, isMuted, isCameraOff, remoteMuteStates, remoteCameraStates } = callState;

    const remoteEntries = Object.entries(remoteStreams);
    // Total participants = remotes + local (me)
    const totalParticipants = remoteEntries.length + 1;

    // Determine grid class based on participant count
    const getGridClass = () => {
        if (totalParticipants <= 1) return 'group-video-grid--1';
        if (totalParticipants === 2) return 'group-video-grid--2';
        if (totalParticipants <= 4) return 'group-video-grid--4';
        if (totalParticipants <= 6) return 'group-video-grid--6';
        return 'group-video-grid--many';
    };

    return (
        <div className={`group-video-grid justify-center ${getGridClass()}`}>
            {/* Local participant (me) */}
            <div className="group-video-grid__tile" key="local">
                <ParticipantTile
                    stream={localStream}
                    userId={user?.id || 'local'}
                    isLocal={true}
                    isMuted={isMuted}
                    isCameraOff={isCameraOff}
                    variant="video"
                    displayName="You"
                />
            </div>

            {/* Remote participants */}
            {remoteEntries.map(([userId, stream]) => (
                <div className="group-video-grid__tile" key={userId}>
                    <ParticipantTile
                        stream={stream}
                        userId={userId}
                        isLocal={false}
                        isMuted={remoteMuteStates?.[userId] || false}
                        isCameraOff={remoteCameraStates?.[userId] || false}
                        variant="video"
                    />
                </div>
            ))}
        </div>
    );
};
