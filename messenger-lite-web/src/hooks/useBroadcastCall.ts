'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/useAuth';

const BROADCAST_CHANNEL_NAME = 'messenger_call_state';

type BroadcastMessage =
    | { type: 'CALL_STARTED'; callId: string; userId: string }
    | { type: 'CALL_ENDED'; userId: string }
    | { type: 'FORCE_CLOSE_CALL'; userId?: string }
    | { type: 'CHECK_CALL_STATUS'; userId: string }
    | { type: 'ACTIVE_CALL_STATUS'; callId: string | null; userId: string };

export function useBroadcastCall() {
    const { user } = useAuth();
    const [activeCallId, setActiveCallId] = useState<string | null>(null);

    const postMessage = useCallback((msg: BroadcastMessage) => {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage(msg);
        channel.close();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        
        channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
            const data = event.data;
            // Ignore messages for other users (e.g., local testing in same browser)
            // But if FORCE_CLOSE_CALL comes without userId (legacy), we can accept it or ignore.
            if (data.userId && data.userId !== user.id) return;

            if (data.type === 'CALL_STARTED') {
                setActiveCallId(data.callId);
            } else if (data.type === 'CALL_ENDED') {
                setActiveCallId(null);
            } else if (data.type === 'CHECK_CALL_STATUS') {
                // Respond if we have an active call
                if (activeCallId) {
                    postMessage({ type: 'ACTIVE_CALL_STATUS', callId: activeCallId, userId: user.id });
                }
            } else if (data.type === 'ACTIVE_CALL_STATUS') {
                if (data.callId) {
                    setActiveCallId(data.callId);
                }
            }
        };

        // Query status on mount
        postMessage({ type: 'CHECK_CALL_STATUS', userId: user.id });

        return () => channel.close();
    }, [user?.id, activeCallId, postMessage]);

    return { activeCallId, postMessage };
}
