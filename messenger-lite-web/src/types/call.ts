export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

export interface CallUser {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
}

export interface CallState {
    callId: string | null;
    callType: CallType;
    callStatus: CallStatus;
    endReason?: 'user_left' | 'network_unstable' | 'rejected' | 'last_participant' | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null; // Deprecated, keep for backward compat
    remoteStreams: Record<string, MediaStream>;
    participants: CallUser[];
    participantIds: string[];       // List of user IDs currently in the call
    isGroupCall: boolean;           // True when more than 2 participants
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
    callDuration: number;
    caller: { id: string } | null;
    // Track mute/camera state of remote participants
    remoteMuteStates: Record<string, boolean>;
    remoteCameraStates: Record<string, boolean>;
}

export interface CallContextType {
    callState: CallState;
    startCall: (toUserId: string | string[], type: CallType, callId: string, conversationId: string) => void;
    answerCall: (callId: string, type: CallType) => void;
    endCall: () => void;
    leaveCall: () => void;
    toggleMute: () => void;
    toggleCamera: () => void;
    toggleScreenShare: () => void;
    setLocalStream: (stream: MediaStream | null) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    updateCallStatus: (status: CallStatus) => void;
}