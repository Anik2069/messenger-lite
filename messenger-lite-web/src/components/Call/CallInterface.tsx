'use client';
import { CALL_SECRET } from '@/constant';
import { useCall } from '@/context/CallContext';
import { base64UrlDecode } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AudioCallView } from './AudioCallView';
import { VideoCallView } from './VideoCallView';
import { useAuth } from '@/context/useAuth';

const secretKey = CALL_SECRET;

const CallInterface = ({ callId }: { callId: string }) => {
  const { callState, startCall, answerCall, endCall } = useCall();

  const { user, initialLoading } = useAuth();
  const searchParams = useSearchParams();
  const payload = searchParams.get('payload') as string;
  const hasInitialized = useRef(false);
  const [callError, setCallError] = useState<string | null>(null);

  // On Mount
  useEffect(() => {
    if (initialLoading || !user || hasInitialized.current) {
      return;
    }

    // ── Step 1: Decode payload (browser-safe, wrapped in try/catch) ──
    let decoded: ReturnType<typeof base64UrlDecode>;
    try {
      decoded = base64UrlDecode(payload);
    } catch (err) {
      const msg = `Failed to decode call payload: ${(err as Error).message}`;
      console.error('[CallInterface]', msg, { payload });
      setCallError(msg);
      endCall();
      return;
    }

    const {
      callId: payloadCallId,
      type,
      toUserIds,
      token,
      CALL_SECRET: payloadSecret,
      isCaller,
      conversationId,
    } = decoded;

    console.log('[CallInterface] Decoded payload:', {
      callId,
      payloadCallId,
      type,
      toUserIds,
      token: token ? '***' : undefined,
      CALL_SECRET: payloadSecret,
      isCaller,
      initialLoading,
      user: user?.id,
      hasInitialized: hasInitialized.current,
    });

    // ── Step 2: Validate required fields ──
    if (!payloadCallId || !type || !toUserIds || !token || !payloadSecret) {
      const msg = 'Payload validation failed — missing required fields.';
      console.error('[CallInterface]', msg, {
        payloadCallId,
        type,
        toUserIds,
        token: !!token,
        CALL_SECRET: payloadSecret,
      });
      setCallError(msg);
      endCall();
      return;
    }

    // ── Step 3: Validate callId matches ──
    if (callId !== payloadCallId) {
      const msg = `Call ID mismatch: URL="${callId}" payload="${payloadCallId}"`;
      console.error('[CallInterface]', msg);
      setCallError(msg);
      endCall();
      return;
    }

    // ── Step 4: Validate CALL_SECRET ──
    if (payloadSecret !== secretKey) {
      const msg = 'CALL_SECRET mismatch — unauthorised call.';
      console.error('[CallInterface]', msg, { payloadSecret, secretKey });
      setCallError(msg);
      endCall();
      return;
    }

    // ── Step 5: Prevent double-init ──
    if (
      callState.callId === callId &&
      (callState.callStatus === 'ringing' || callState.callStatus === 'connected')
    ) {
      return;
    }

    hasInitialized.current = true;

    if (isCaller) {
      console.log('[CallInterface] Starting call as caller', { toUserIds, type, callId, conversationId });
      startCall(toUserIds, type, callId, conversationId);
    } else {
      console.log('[CallInterface] Answering call as callee', { callId, type });
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

  // ── Error state: show visible error instead of blank/closed window ──
  if (callError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#111827',
          color: '#f87171',
          fontFamily: 'sans-serif',
          padding: '2rem',
          textAlign: 'center',
          gap: '1rem',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Call failed to start
        </h1>
        <p style={{ color: '#9ca3af', maxWidth: '380px', margin: 0, fontSize: '0.9rem' }}>
          {callError}
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: 0 }}>
          Check the browser console for details. This window will close automatically.
        </p>
        <button
          onClick={() => window.close()}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1.5rem',
            background: '#374151',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Close Window
        </button>
      </div>
    );
  }

  if (callState.callType === 'audio') {
    return <AudioCallView callId={callId} />;
  }

  return <VideoCallView callId={callId} />;
};

export default CallInterface;
