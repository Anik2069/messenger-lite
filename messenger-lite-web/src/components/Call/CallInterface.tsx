'use client';
import { CALL_SECRET } from '@/constant';
import { useCall } from '@/context/CallContext';
import { base64UrlDecode } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { AudioCallView } from './AudioCallView';
import { VideoCallView } from './VideoCallView';

import { useAuth } from '@/context/useAuth';

const secretKey = CALL_SECRET;
const CallInterface = ({ callId }: { callId: string }) => {
  const { callState, startCall, answerCall, endCall } = useCall();

  const { user, initialLoading } = useAuth();
  const searchParams = useSearchParams();
  const payload = searchParams.get('payload') as string;
  console.log(payload, 'payload--------------');
  const hasInitialized = useRef(false);

  // On Mount
  useEffect(() => {
    if (initialLoading || !user || hasInitialized.current) {
      //   return;
    }

    const {
      callId: payloadCallId,
      type,
      toUserIds,
      token,
      CALL_SECRET,
      isCaller,
    } = base64UrlDecode(payload);

    console.log(
      callId,
      'callId',
      type,
      'type',
      toUserIds,
      'toUserIds',
      token,
      'token',
      CALL_SECRET,
      'CALL_SECRET',
      isCaller,
      'isCaller',
      initialLoading,
      'initialLoading',
      user,
      'user',
      hasInitialized,
      'hasInitialized',
      payload
    );

    // console.log(payloadCallId, "payloadCallId", type, "type", toUserIds, "toUserIds", token, "token", CALL_SECRET, "CALL_SECRET")

    if (!payloadCallId || !type || !toUserIds || !token || !CALL_SECRET) {
      console.error('Payload validation failed! Missing properties:', {
        payloadCallId,
        type,
        toUserIds,
        token,
        CALL_SECRET,
      });
      endCall();
      // return;
    }

    if (callId !== payloadCallId) {
      console.error('Payload callId mismatch:', callId, payloadCallId);
      endCall();
      // return;
    }

    if (CALL_SECRET !== secretKey) {
      console.error('Payload CALL_SECRET mismatch:', CALL_SECRET, secretKey);
      endCall();
      // return;
    }

    // Prevent double init
    if (
      callState.callId === callId &&
      (callState.callStatus === 'ringing' || callState.callStatus === 'connected')
    ) {
      // return;
    }

    hasInitialized.current = true;

    if (isCaller) {
      // We are the caller
      console.log('We are the caller', toUserIds, type, callId);
      startCall(toUserIds, type, callId);
    } else {
      // We are joining (Callee)
      answerCall(callId, type);
    }
  }, [
    callId,
    payload,
    startCall,
    answerCall,
    initialLoading,
    user,
    callState.callId,
    callState.callStatus,
    endCall,
  ]);

  if (callState.callType === 'audio') {
    return <AudioCallView callId={callId} />;
  }

  return <VideoCallView callId={callId} />;
};

export default CallInterface;
