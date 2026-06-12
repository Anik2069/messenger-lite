'use client';

import { Button } from '@/components/ui/button';
import { Chat } from '../../../types/ChatType';
import ChatHeaderActions from './ChatHeaderActions';
import { Phone, Video } from 'lucide-react';
import { CALL_SECRET, MEDIA_HOST } from '@/constant';
import { DummyAvatar } from '@/assets/image';
import AvatarImage from '../../reusable/AvatarImage';
import { Tooltip } from '@/components/ui/tooltip';
// import { useCall } from '@/context/CallContext';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/useAuth';
import { base64UrlEncode } from '@/lib/utils';
import { useBroadcastCall } from '@/hooks/useBroadcastCall';
import { CallConfirmationModal } from '@/components/Call/CallConfirmationModal';

interface ChatHeaderProps {
  selectedChat: any;
}




const ChatHeader = ({ selectedChat }: ChatHeaderProps) => {
  // const { startCall } = useCall(); // CallProvider is no longer global
  const { user } = useAuth();

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [isCalling, setIsCalling] = useState(false);
  // console.log(selectedChat, "selectedChat")

  const image = selectedChat.avatar
    ? `${MEDIA_HOST}/${selectedChat.avatar}`
    : DummyAvatar.src;

  const isDirectChat = selectedChat.type === 'user';
  const isOnline = selectedChat.isOnline || false;

  // Prevent calling yourself
  const isCurrentUser = selectedChat.userId === user?.id;

  const [showCallConfirm, setShowCallConfirm] = useState(false);
  const [pendingCall, setPendingCall] = useState<{ type: 'audio' | 'video', userIds: string[] } | null>(null);
  const { activeCallId, postMessage } = useBroadcastCall();

  const initiateCall = (type: 'audio' | 'video', toUserIds: string[]) => {
    // Check if call is already active
    if (activeCallId) {
      setPendingCall({ type, userIds: toUserIds });
      setShowCallConfirm(true);
      return;
    }
    performCallInitiation(type, toUserIds);
  };

  const performCallInitiation = (type: 'audio' | 'video', toUserIds: string[]) => {
    const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const toParam = toUserIds.join(',');
    const payload = {
      callId,
      type,
      toUserIds,
      token,
      CALL_SECRET,
      isCaller: true
    }
    const base64Payload = base64UrlEncode(payload);

    const url = `/call/${callId}?payload=${base64Payload}`;
    window.open(url, 'MessengerCall', 'width=1280,height=720');
  };

  const handleConfirmSwitchCall = () => {
    // Force close existing call
    postMessage({ type: 'FORCE_CLOSE_CALL' });

    // Wait a bit? Or just open new window (which reuses same window name)
    // If we use same window name 'MessengerCall', it should overwrite.
    // But purely relying on window name might not kill the socket cleanly if we don't 'force close' first.

    if (pendingCall) {
      setTimeout(() => {
        performCallInitiation(pendingCall.type, pendingCall.userIds);
        setShowCallConfirm(false);
        setPendingCall(null);
      }, 500);
    }
  };

  const handleVideoCall = () => {
    if (isDirectChat) {
      initiateCall('video', [selectedChat.userId || selectedChat.id]);
    } else if (selectedChat.participants) {
      // Group call logic
      const participantIds = selectedChat.participants
        .map((p: any) => p.id || p.userId)
        .filter((id: string) => id !== user?.id);

      if (participantIds.length > 0) {
        initiateCall('video', participantIds);
      } else {
        console.warn("No participants found for group call");
      }
    }
  };

  const handleAudioCall = () => {
    if (isDirectChat) {
      initiateCall('audio', [selectedChat.userId || selectedChat.id]);
    } else if (selectedChat.participants) {
      // Group call logic
      const participantIds = selectedChat.participants
        .map((p: any) => p.id || p.userId)
        .filter((id: string) => id !== user?.id);

      if (participantIds.length > 0) {
        initiateCall('audio', participantIds);
      }
    }
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-10 h-10 mr-3">
          <AvatarImage src={image} alt={selectedChat.name} />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {selectedChat.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            {selectedChat.type === 'group' ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Group chat • {selectedChat.memberCount || 'Multiple'} members
              </span>
            ) : (
              <span className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                ></span>
                {isOnline ? 'Online' : 'Offline'}
                {isCalling && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                    Calling...
                  </span>
                )}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Call Buttons - Show for direct and group with participants */}
        {(!isCurrentUser && (isDirectChat || (selectedChat.type === 'group' && selectedChat.participants))) && (
          <div className="flex items-center border-r border-gray-200 dark:border-gray-700 pr-3 mr-3">
            {!isCurrentUser && (
              <Button
                variant="ghost"
                size="icon"
                className={`hover:bg-gray-200 dark:hover:bg-gray-700 transition ${isCalling ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleVideoCall}
              >
                <Video className={`w-5 h-5 ${isCalling ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`} />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={`hover:bg-gray-200 dark:hover:bg-gray-700 transition ${isCalling ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleAudioCall}
            >
              <Phone className={`w-5 h-5 ${isCalling ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`} />
            </Button>
          </div>
        )}

        {/* Other actions */}
        <ChatHeaderActions conversationId={selectedChat.id} />
      </div>

      <CallConfirmationModal
        isOpen={showCallConfirm}
        onClose={() => setShowCallConfirm(false)}
        onConfirm={handleConfirmSwitchCall}
      />
    </div>
  );
};

export default ChatHeader;