export type CallType = 'audio' | 'video';
export type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended';

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
    localStream: MediaStream | null;
    remoteStream: MediaStream | null; // Deprecated, keep for backward compat or remove if possible
    remoteStreams: Record<string, MediaStream>; // Added for group calls
    participants: CallUser[];
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
    callDuration: number;
    caller: { id: string } | null; // Simplified from CallUser for now as we just use ID often
}

export interface CallContextType {
    callState: CallState;
    startCall: (toUserId: string | string[], type: CallType, callId: string) => void;
    answerCall: (callId: string, type: CallType) => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleCamera: () => void;
    toggleScreenShare: () => void;
    setLocalStream: (stream: MediaStream | null) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    updateCallStatus: (status: CallStatus) => void;
}