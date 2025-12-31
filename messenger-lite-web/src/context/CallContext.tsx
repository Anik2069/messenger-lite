'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { CallState, CallContextType, CallType, CallStatus } from '@/types/call';
import { getCallSocket, disconnectCallSocket } from '@/lib/callSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useAuth } from '@/context/useAuth';

const initialState: CallState = {
  callId: null,
  callType: 'audio',
  callStatus: 'idle',
  localStream: null,
  remoteStream: null,
  remoteStreams: {},
  participants: [],
  isMuted: false,
  isCameraOff: false,
  isScreenSharing: false,
  callDuration: 0,
  caller: null,
};

const CallContext = createContext<CallContextType | undefined>(undefined);

function callReducer(state: CallState, action: any): CallState {
  switch (action.type) {
    case 'SET_CALL_ID':
      return { ...state, callId: action.payload };
    case 'SET_CALL_TYPE':
      return { ...state, callType: action.payload };
    case 'SET_CALL_STATUS':
      return { ...state, callStatus: action.payload };
    case 'SET_LOCAL_STREAM':
      return { ...state, localStream: action.payload };
    case 'SET_REMOTE_STREAM':
      return { ...state, remoteStream: action.payload };
    case 'ADD_REMOTE_STREAM':
      return {
        ...state,
        remoteStreams: {
          ...state.remoteStreams,
          [action.payload.userId]: action.payload.stream
        }
      } as any;
    case 'REMOVE_REMOTE_STREAM':
      const newStreams = { ...state.remoteStreams } as Record<string, MediaStream>;
      delete newStreams[action.payload.userId];
      return { ...state, remoteStreams: newStreams } as any;
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_CAMERA':
      return { ...state, isCameraOff: !state.isCameraOff };
    case 'TOGGLE_SCREEN_SHARE':
      return { ...state, isScreenSharing: !state.isScreenSharing };
    case 'SET_CALL_DURATION':
      return { ...state, callDuration: action.payload };
    case 'SET_CALLER':
      return { ...state, caller: action.payload };
    case 'RESET_CALL':
      return { ...initialState, localStream: state.localStream };
    default:
      return state;
  }
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(callReducer, {
    ...initialState,
    remoteStreams: {}
  } as any);

  const socket = getCallSocket();
  const { user } = useAuth();

  const {
    createPeerConnection,
    closePeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate
  } = useWebRTC(state, dispatch, socket);

  // Helper to initialize media
  const initMedia = useCallback(async (type: CallType = 'audio') => {
    try {
      const constraints = {
        audio: true,
        video: type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      dispatch({ type: 'SET_LOCAL_STREAM', payload: stream });
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Please allow camera and microphone access');
      return null;
    }
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket.connected) socket.connect();

    if (state.callId && user?.id) {
      // Join the room for signaling
      socket.emit("join_call", { callId: state.callId, userId: user.id });
    }

    socket.on('call_initiated', ({ callId, recipients, callType }) => {
      console.log("Call initiated confirmed:", callId);
      dispatch({ type: 'SET_CALL_STATUS', payload: 'ringing' });
    });

    socket.on('call_answered', async ({ fromUserId, callId }) => {
      console.log('Call answered by', fromUserId);
      dispatch({ type: 'SET_CALL_STATUS', payload: 'connected' });

      const peer = createPeerConnection(fromUserId);
      if (peer) {
        // As per convention: Caller creates offer.
        if (state.caller?.id === user?.id) {
          console.log("I am caller, creating offer for", fromUserId);
          await createOffer(fromUserId);
        }
      }
    });

    socket.on('user_joined_call', async ({ userId: newUserId }) => {
      console.log('User joined call:', newUserId);
      // If I am callers, I assume I'm responsible for offering to new joiners?
      if (state.caller?.id === user?.id && newUserId !== user?.id) {
        const peer = createPeerConnection(newUserId);
        if (peer) await createOffer(newUserId);
      }
    });

    socket.on('call_ended', ({ fromUserId, callId }) => {
      console.log('Call ended by', fromUserId, 'callId:', callId);
      closePeerConnection();
      dispatch({ type: 'RESET_CALL' });
      dispatch({ type: 'SET_CALL_STATUS', payload: 'ended' });
      setTimeout(() => window.close(), 2000);
    });

    socket.on('call_rejected', ({ fromUserId }) => {
      console.log('Call rejected by', fromUserId);
      dispatch({ type: 'SET_CALL_STATUS', payload: 'ended' });
      setTimeout(() => window.close(), 2000);
    });

    socket.on('webrtc_offer', async ({ sdp, fromUserId }) => {
      console.log("Received offer from", fromUserId);
      const peer = createPeerConnection(fromUserId);
      if (peer) {
        await handleOffer(sdp, fromUserId);
      }
    });

    socket.on('webrtc_answer', async ({ sdp, fromUserId }) => {
      console.log("Received answer from", fromUserId);
      await handleAnswer(sdp, fromUserId);
    });

    socket.on('webrtc_ice_candidate', async ({ candidate, fromUserId }) => {
      await handleIceCandidate(candidate, fromUserId);
    });

    return () => {
      socket.off('call_initiated');
      socket.off('call_answered');
      socket.off('user_joined_call');
      socket.off('call_ended');
      socket.off('call_rejected');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      disconnectCallSocket();
    };
  }, [state.callId, user?.id, createPeerConnection, createOffer, handleOffer, handleAnswer, handleIceCandidate, closePeerConnection]);

  // Call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.callStatus === 'connected') {
      timer = setInterval(() => {
        dispatch({ type: 'SET_CALL_DURATION', payload: state.callDuration + 1 });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.callStatus, state.callDuration]);

  // Use useCallback to keep reference stable
  const startCall = useCallback(async (toUserId: string | string[], type: CallType, callId: string) => {
    const stream = await initMedia(type);
    if (!stream) return;

    dispatch({ type: 'SET_CALL_ID', payload: callId });
    dispatch({ type: 'SET_CALL_TYPE', payload: type });
    dispatch({ type: 'SET_CALLER', payload: { id: user?.id } });
    console.log(toUserId, "toUserId", type, "type", callId, "callId")
    socket.emit('call_user', {
      toUserIds: Array.isArray(toUserId) ? toUserId : [toUserId],
      callType: type,
      callId,
    });
  }, [initMedia, user?.id]);

  const answerCall = useCallback(async (callId: string, type: CallType) => {
    // Determine type from URL or prev state, simplified here to assume passed correctly
    const stream = await initMedia(type);
    if (!stream) return;

    dispatch({ type: 'SET_CALL_ID', payload: callId });
    dispatch({ type: 'SET_CALL_TYPE', payload: type });
    dispatch({ type: 'SET_CALL_STATUS', payload: 'connected' }); // Optimistic

    socket.emit('call_answered', { callId });
  }, [initMedia]);

  const endCall = useCallback(() => {
    if (state.callId) {
      socket.emit('call_ended', { callId: state.callId });
    }
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    closePeerConnection();
    dispatch({ type: 'RESET_CALL' });
    window.close();
  }, [state.callId, state.localStream, closePeerConnection]);

  const toggleMute = useCallback(() => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = !state.isMuted;
      });
    }
    dispatch({ type: 'TOGGLE_MUTE' });
  }, [state.localStream, state.isMuted]);

  const toggleCamera = useCallback(() => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = state.isCameraOff;
      });
    }
    dispatch({ type: 'TOGGLE_CAMERA' });
  }, [state.localStream, state.isCameraOff]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (state.isScreenSharing) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        dispatch({ type: 'SET_LOCAL_STREAM', payload: stream });
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true,
        });
        dispatch({ type: 'SET_LOCAL_STREAM', payload: stream });
      }
      dispatch({ type: 'TOGGLE_SCREEN_SHARE' });
    } catch (error) {
      console.error('Screen share error:', error);
    }
  }, [state.isScreenSharing]);

  // Hacky partial update of context type to match existing components if needed
  // Or assuming components will update to match new signature
  const value: any = {
    callState: state,
    startCall,
    answerCall,  // This now expects (callId, type)
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    setLocalStream: (stream: MediaStream) => dispatch({ type: 'SET_LOCAL_STREAM', payload: stream }),
    setRemoteStream: (stream: MediaStream) => { }, // legacy
    updateCallStatus: (status: CallStatus) => dispatch({ type: 'SET_CALL_STATUS', payload: status }),
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}