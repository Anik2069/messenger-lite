'use client';
import React, { useEffect, useRef } from "react";
import { useCall } from "@/context/CallContext";
import { useAuth } from "@/context/useAuth";
import { ParticipantTile } from "./ParticipantTile";

interface GroupAudioGridProps {
    callId: string;
}

export const GroupAudioGrid = ({}: GroupAudioGridProps) => {
    const { callState } = useCall();
    const { user } = useAuth();
    const { remoteStreams, localStream, isMuted, remoteMuteStates } = callState;

    const remoteEntries = Object.entries(remoteStreams);
    const remoteAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Attach remote audio streams to invisible <audio> elements for playback
    useEffect(() => {
        remoteEntries.forEach(([userId, stream]) => {
            if (!remoteAudioRefs.current[userId]) {
                const audio = new Audio();
                audio.autoplay = true;
                remoteAudioRefs.current[userId] = audio;
            }
            if (remoteAudioRefs.current[userId].srcObject !== stream) {
                remoteAudioRefs.current[userId].srcObject = stream;
            }
        });

        // Clean up removed streams
        Object.keys(remoteAudioRefs.current).forEach(userId => {
            if (!remoteStreams[userId]) {
                remoteAudioRefs.current[userId].pause();
                remoteAudioRefs.current[userId].srcObject = null;
                delete remoteAudioRefs.current[userId];
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteStreams]);

    const totalParticipants = remoteEntries.length + 1;

    const getGridClass = () => {
        if (totalParticipants <= 2) return 'group-audio-grid--2';
        if (totalParticipants <= 4) return 'group-audio-grid--4';
        return 'group-audio-grid--many';
    };

    return (
        <div className={`group-audio-grid ${getGridClass()}`}>
            {/* Local participant (me) */}
            <div className="group-audio-grid__tile" key="local">
                <ParticipantTile
                    stream={localStream}
                    userId={user?.id || 'local'}
                    isLocal={true}
                    isMuted={isMuted}
                    isCameraOff={true}
                    variant="audio"
                    displayName="You"
                />
            </div>

            {/* Remote participants */}
            {remoteEntries.map(([userId, stream]) => (
                <div className="group-audio-grid__tile" key={userId}>
                    <ParticipantTile
                        stream={stream}
                        userId={userId}
                        isLocal={false}
                        isMuted={remoteMuteStates?.[userId] || false}
                        isCameraOff={true}
                        variant="audio"
                    />
                </div>
            ))}
        </div>
    );
};
