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
  participantIds: [],
  isGroupCall: false,
  isMuted: false,
  isCameraOff: false,
  isScreenSharing: false,
  callDuration: 0,
  caller: null,
  remoteMuteStates: {},
  remoteCameraStates: {},
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
      };
    case 'REMOVE_REMOTE_STREAM': {
      const newStreams = { ...state.remoteStreams };
      delete newStreams[action.payload.userId];
      // Also clean up remote states
      const newMuteStates = { ...state.remoteMuteStates };
      delete newMuteStates[action.payload.userId];
      const newCameraStates = { ...state.remoteCameraStates };
      delete newCameraStates[action.payload.userId];
      return {
        ...state,
        remoteStreams: newStreams,
        remoteMuteStates: newMuteStates,
        remoteCameraStates: newCameraStates,
      };
    }
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'SET_PARTICIPANT_IDS':
      return {
        ...state,
        participantIds: action.payload,
        isGroupCall: action.payload.length > 2,
      };
    case 'SET_IS_GROUP_CALL':
      return { ...state, isGroupCall: action.payload };
    case 'SET_REMOTE_MUTE_STATE':
      return {
        ...state,
        remoteMuteStates: {
          ...state.remoteMuteStates,
          [action.payload.userId]: action.payload.isMuted,
        },
      };
    case 'SET_REMOTE_CAMERA_STATE':
      return {
        ...state,
        remoteCameraStates: {
          ...state.remoteCameraStates,
          [action.payload.userId]: action.payload.isCameraOff,
        },
      };
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
    case 'SET_END_REASON':
      return { ...state, endReason: action.payload };
    case 'RESET_CALL':
      return { ...initialState, localStream: state.localStream };
    default:
      return state;
  }
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(callReducer, initialState);

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
          width: { ideal: 640, max: 640 },
          height: { ideal: 480, max: 480 },
          frameRate: { ideal: 15, max: 20 },
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

  // Socket event handlers — cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectCallSocket();
    };
  }, []);

  // Main socket event wiring
  useEffect(() => {
    if (!socket.connected) socket.connect();

    if (state.callId && user?.id) {
      socket.emit("join_call", { callId: state.callId, userId: user.id });
    }

    // ─── Call Initiated (caller confirmation) ───
    socket.on('call_initiated', ({ callId }) => {
      console.log("Call initiated confirmed:", callId);
      dispatch({ type: 'SET_CALL_STATUS', payload: 'ringing' });
    });

    // ─── Call Answered (someone answered) ───
    socket.on('call_answered', async ({ fromUserId }) => {
      console.log('Call answered by', fromUserId);
      dispatch({ type: 'SET_CALL_STATUS', payload: 'connecting' });

      const peer = createPeerConnection(fromUserId);
      if (peer && state.caller?.id === user?.id) {
        console.log("I am caller, creating offer for", fromUserId);
        await createOffer(fromUserId);
      }
    });

    // ─── Existing Participants (sent to joiner on join) ───
    socket.on('existing_participants', async ({ participants, isGroupCall }: { participants: string[], isGroupCall: boolean }) => {
      console.log('Existing participants in room:', participants, '| Group:', isGroupCall);
      dispatch({ type: 'SET_IS_GROUP_CALL', payload: isGroupCall });

      // Create peer connections to all existing participants
      for (const peerId of participants) {
        if (peerId !== user?.id) {
          createPeerConnection(peerId);
        }
      }
    });

    // ─── Participant Joined (broadcast to all in room) ───
    socket.on('participant_joined', async ({ userId: newUserId, participants, isGroupCall }: { userId: string, participants: string[], isGroupCall: boolean }) => {
      console.log('Participant joined:', newUserId, '| Total:', participants.length, '| Group:', isGroupCall);

      dispatch({ type: 'SET_PARTICIPANT_IDS', payload: participants });
      dispatch({ type: 'SET_IS_GROUP_CALL', payload: isGroupCall });

      // If a NEW user joined (not me), create a peer connection and send offer
      if (newUserId !== user?.id) {
        const peer = createPeerConnection(newUserId);
        if (peer) {
          await createOffer(newUserId);
        }
      }
    });

    // ─── Participant Left (someone left but call continues) ───
    socket.on('participant_left', ({ userId: leftUserId, participants, isGroupCall }: { userId: string, participants: string[], isGroupCall: boolean }) => {
      console.log('Participant left:', leftUserId, '| Remaining:', participants.length);

      dispatch({ type: 'SET_PARTICIPANT_IDS', payload: participants });
      dispatch({ type: 'SET_IS_GROUP_CALL', payload: isGroupCall });

      // Close the peer connection for the user who left
      closePeerConnection(leftUserId);
    });

    // ─── User Joined Call (legacy, still used for initial handshake) ───
    socket.on('user_joined_call', async ({ userId: newUserId }) => {
      console.log('User joined call (legacy):', newUserId);
      // This is handled by participant_joined now, but keep for backward compat
    });

    // ─── Call Ended (entire call terminated) ───
    socket.on('call_ended', ({ fromUserId, callId, reason }) => {
      console.log('Call ended by', fromUserId, 'callId:', callId, 'reason:', reason);
      closePeerConnection();
      dispatch({ type: 'RESET_CALL' });
      dispatch({ type: 'SET_END_REASON', payload: reason || 'user_left' });
      dispatch({ type: 'SET_CALL_STATUS', payload: 'ended' });

      const channel = new BroadcastChannel('messenger_call_state');
      channel.postMessage({ type: 'CALL_ENDED', userId: user?.id });
      channel.close();

      setTimeout(() => window.close(), 2000);
    });

    // ─── Call Rejected ───
    socket.on('call_rejected', ({ fromUserId }) => {
      console.log('Call rejected by', fromUserId);
      dispatch({ type: 'SET_END_REASON', payload: 'rejected' });
      dispatch({ type: 'SET_CALL_STATUS', payload: 'ended' });
      setTimeout(() => window.close(), 2000);
    });

    // ─── Remote mute/camera state ───
    socket.on('mute_toggled', ({ userId: remoteUserId, isMuted }: { userId: string, isMuted: boolean }) => {
      dispatch({ type: 'SET_REMOTE_MUTE_STATE', payload: { userId: remoteUserId, isMuted } });
    });

    socket.on('camera_toggled', ({ userId: remoteUserId, isCameraOff }: { userId: string, isCameraOff: boolean }) => {
      dispatch({ type: 'SET_REMOTE_CAMERA_STATE', payload: { userId: remoteUserId, isCameraOff } });
    });

    // ─── WebRTC Signals ───
    socket.on('webrtc_offer', async ({ sdp, fromUserId }) => {
      const peer = createPeerConnection(fromUserId);
      if (peer) {
        await handleOffer(sdp, fromUserId);
      }
    });

    socket.on('webrtc_answer', async ({ sdp, fromUserId }) => {
      await handleAnswer(sdp, fromUserId);
    });

    socket.on('webrtc_ice_candidate', async ({ candidate, fromUserId }) => {
      await handleIceCandidate(candidate, fromUserId);
    });

    return () => {
      socket.off('call_initiated');
      socket.off('call_answered');
      socket.off('existing_participants');
      socket.off('participant_joined');
      socket.off('participant_left');
      socket.off('user_joined_call');
      socket.off('call_ended');
      socket.off('call_rejected');
      socket.off('mute_toggled');
      socket.off('camera_toggled');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
    };
  }, [state.callId, user?.id, createPeerConnection, createOffer, handleOffer, handleAnswer, handleIceCandidate, closePeerConnection, state.caller?.id]);

  // ─── Start Call ───
  const startCall = useCallback(async (toUserId: string | string[], type: CallType, callId: string) => {
    const stream = await initMedia(type);
    if (!stream) return;

    dispatch({ type: 'SET_CALL_ID', payload: callId });
    dispatch({ type: 'SET_CALL_TYPE', payload: type });
    dispatch({ type: 'SET_CALLER', payload: { id: user?.id } });

    socket.emit('call_user', {
      toUserIds: Array.isArray(toUserId) ? toUserId : [toUserId],
      callType: type,
      callId,
    });

    const channel = new BroadcastChannel('messenger_call_state');
    channel.postMessage({ type: 'CALL_STARTED', callId, userId: user?.id });
    channel.close();
  }, [initMedia, user?.id]);

  // ─── Answer Call ───
  const answerCall = useCallback(async (callId: string, type: CallType) => {
    const stream = await initMedia(type);
    if (!stream) return;

    dispatch({ type: 'SET_CALL_ID', payload: callId });
    dispatch({ type: 'SET_CALL_TYPE', payload: type });
    dispatch({ type: 'SET_CALL_STATUS', payload: 'connecting' });

    const channel = new BroadcastChannel('messenger_call_state');
    channel.postMessage({ type: 'CALL_STARTED', callId, userId: user?.id });
    channel.close();

    socket.emit('call_answered', { callId });
  }, [initMedia]);

  // ─── End Call (terminates entire call for everyone) ───
  const endCall = useCallback(() => {
    if (state.callId) {
      socket.emit('call_ended', { callId: state.callId });
    }
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    closePeerConnection();
    dispatch({ type: 'RESET_CALL' });

    const channel = new BroadcastChannel('messenger_call_state');
    channel.postMessage({ type: 'CALL_ENDED', userId: user?.id });
    channel.close();

    window.close();
  }, [state.callId, state.localStream, closePeerConnection, user?.id]);

  // ─── Leave Call (user leaves, call continues for others) ───
  const leaveCall = useCallback(() => {
    if (state.callId) {
      socket.emit('leave_call', { callId: state.callId });
    }
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    closePeerConnection();
    dispatch({ type: 'RESET_CALL' });

    const channel = new BroadcastChannel('messenger_call_state');
    channel.postMessage({ type: 'CALL_ENDED', userId: user?.id });
    channel.close();

    window.close();
  }, [state.callId, state.localStream, closePeerConnection, user?.id]);

  // Handle unload to clean up
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use leaveCall behavior (graceful) rather than endCall (force everyone out)
      if (state.callId) {
        socket.emit('leave_call', { callId: state.callId });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.callId]);

  // Broadcast Channel Listener for Status Checks and Force Close
  useEffect(() => {
    if (!user?.id) return;
    const channel = new BroadcastChannel('messenger_call_state');
    channel.onmessage = (event) => {
      if (event.data.userId && event.data.userId !== user.id) return;

      if (event.data.type === 'CHECK_CALL_STATUS' && state.callStatus === 'connected') {
        channel.postMessage({ type: 'CALL_STATUS_RESPONSE', callId: state.callId, userId: user.id });
      }
      if (event.data.type === 'FORCE_CLOSE_CALL') {
        console.log("Force closing call from other tab");
        leaveCall();
      }
    };
    if (state.callStatus === 'connected' && state.callId) {
      channel.postMessage({ type: 'CALL_STARTED', callId: state.callId, userId: user.id });
    }
    return () => channel.close();
  }, [state.callStatus, state.callId, leaveCall, user?.id]);

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

  const toggleMute = useCallback(() => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = state.isMuted;
      });
    }
    // Broadcast mute state to other participants
    if (state.callId) {
      socket.emit('mute_toggled', { callId: state.callId, isMuted: !state.isMuted });
    }
    dispatch({ type: 'TOGGLE_MUTE' });
  }, [state.localStream, state.isMuted, state.callId]);

  const toggleCamera = useCallback(() => {
    const newCameraState = !state.isCameraOff;
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = state.isCameraOff;
      });
    }

    if (state.callId) {
      socket.emit("camera_toggled", { callId: state.callId, isCameraOff: newCameraState });
    }

    dispatch({ type: 'TOGGLE_CAMERA' });
  }, [state.localStream, state.isCameraOff, state.callId]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (state.isScreenSharing) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: state.callType === 'video' ? {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 15, max: 20 },
            facingMode: 'user',
          } : false,
          audio: true,
        });

        // Respect current mute and camera states
        stream.getAudioTracks().forEach(track => track.enabled = !state.isMuted);
        stream.getVideoTracks().forEach(track => track.enabled = !state.isCameraOff);

        dispatch({ type: 'SET_LOCAL_STREAM', payload: stream });
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 10, max: 15 } // Reduced framerate for screen sharing to save bandwidth
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

  const value: CallContextType = {
    callState: state,
    startCall,
    answerCall,
    endCall,
    leaveCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    setLocalStream: (stream: MediaStream | null) => dispatch({ type: 'SET_LOCAL_STREAM', payload: stream }),
    setRemoteStream: (stream: MediaStream | null) => { }, // legacy
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