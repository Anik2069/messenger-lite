'use client';

import { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
// import { useCall } from '@/context/CallContext'; // No longer used here
import { socket } from '@/lib/socket'; // Chat Socket
import { useAuth } from '@/context/useAuth';
import { CALL_SECRET, MEDIA_HOST } from '@/constant';
import { base64UrlEncode } from '@/lib/utils';
import { useBroadcastCall } from '@/hooks/useBroadcastCall';
import { CallConfirmationModal } from '@/components/Call/CallConfirmationModal';

export default function IncomingCallPopup() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState<{
        callId: string;
        callType: 'audio' | 'video';
        fromUserId: string;
        timestamp: number;
        user?: {
            name: string;
            avatar?: string;
        }
    } | null>(null);

    // Audio ref for ringtone
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { activeCallId, postMessage } = useBroadcastCall();
    const [showConfirm, setShowConfirm] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Initialize ringtone
        audioRef.current = new Audio('/sounds/ringtone.mp3');
        audioRef.current.loop = true;

        // Listen for generic notifications that are calls
        socket.on('notification', (data: any) => {
            if (data.type === 'incoming_call') {
                console.log("Incoming call received via chat notification:", data);

                // If we are the caller (e.g. testing with self), ignore? No, we might be calling ourselves?

                setPopupData({
                    callId: data.callId,
                    callType: data.callType,
                    fromUserId: data.fromUserId,
                    timestamp: data.timestamp,
                    user: { name: 'User' }
                });
                setShowPopup(true);

                // Sound logic
                if (activeCallId) {
                    // Short alert if busy
                    const alertSound = new Audio('/sounds/interaction.mp3');
                    alertSound.play().catch(() => { });
                } else {
                    audioRef.current?.play().catch(e => console.log("Audio play failed", e));
                }

            } else if (data.type === 'call_ended') {
                if (popupData && popupData.callId === data.callId) {
                    closePopup();
                }
            }
        });

        return () => {
            socket.off('notification');
            audioRef.current?.pause();
        };
    }, [popupData, activeCallId]);

    // Auto-close if this specific call is answered in another tab
    useEffect(() => {
        const channel = new BroadcastChannel('messenger_call_state');
        channel.onmessage = (event) => {
            if (event.data.type === 'CALL_STARTED' && popupData && event.data.callId === popupData.callId) {
                closePopup();
            }
        };
        return () => channel.close();
    }, [popupData]);

    const closePopup = () => {
        setShowPopup(false);
        setShowConfirm(false);
        setPopupData(null);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    const handleAcceptClick = () => {
        if (activeCallId) {
            setShowConfirm(true);
        } else {
            proceedAccept();
        }
    };

    const proceedAccept = () => {
        if (popupData) {
            closePopup();

            // Force close any existing (if we confirmed)
            if (activeCallId) {
                postMessage({ type: 'FORCE_CLOSE_CALL', userId: user?.id });
            }

            const payload = {
                callId: popupData.callId,
                type: popupData.callType,
                toUserIds: popupData.fromUserId,
                token,
                CALL_SECRET,
                isCaller: false
            }
            const base64Payload = base64UrlEncode(payload);

            const url = `/call/${popupData.callId}?payload=${base64Payload}`;

            // Use same window name to reuse tab
            // Short timeout to allow force close to propagate if needed?
            setTimeout(() => {
                window.open(url, 'MessengerCall', 'width=1280,height=720');
            }, 100);
        }
    };

    const handleReject = () => {
        if (popupData) {
            // Emit rejection to CHAT socket
            socket.emit('call_rejected', {
                callId: popupData.callId,
                reason: 'User declined'
            });
            closePopup();
        }
    };

    if (!showPopup || !popupData) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
            <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl animate-slideUp">
                {/* Caller Info */}
                <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-blue-500">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">C</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-1">
                        Incoming Call
                    </h2>
                    <p className="text-gray-300">
                        {popupData.callType === 'video' ? 'Video Call' : 'Audio Call'}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-6">
                    {/* Reject */}
                    <button
                        onClick={handleReject}
                        className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                        aria-label="Reject call"
                    >
                        <PhoneOff className="w-6 h-6 text-white" />
                    </button>

                    {/* Accept */}
                    <button
                        onClick={handleAcceptClick}
                        className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors"
                        aria-label="Accept call"
                    >
                        {popupData.callType === 'video' ? (
                            <Video className="w-6 h-6 text-white" />
                        ) : (
                            <Phone className="w-6 h-6 text-white" />
                        )}
                    </button>
                </div>
            </div>
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>

            <CallConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={proceedAccept}
            />
        </div>
    );
}