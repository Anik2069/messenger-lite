'use client';

import { DummyAvatar } from '@/assets/image';
import { Button } from '@/components/ui/button';
import { CALL_SECRET } from '@/constant';
import { Phone, Video } from 'lucide-react';
import AvatarImage from '../../reusable/AvatarImage';
import ChatHeaderActions from './ChatHeaderActions';
// import { useCall } from '@/context/CallContext';
import { CallConfirmationModal } from '@/components/Call/CallConfirmationModal';
import { Status, useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/useAuth';
import { useBroadcastCall } from '@/hooks/useBroadcastCall';
import { base64UrlEncode } from '@/lib/utils';
import { useState } from 'react';
import { Chat } from '@/types/ChatType';

interface ChatHeaderProps {
  selectedChat: Chat;
}




const ChatHeader = ({ selectedChat }: ChatHeaderProps) => {
  // const { startCall } = useCall(); // CallProvider is no longer global
  const { user } = useAuth();
  const { activeStatus, otherStatuses } = useSettings();

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const [isCalling] = useState(false);
  // console.log(selectedChat, "selectedChat")

  const image = selectedChat.avatar
    ? selectedChat.avatar
    : DummyAvatar.src;

  const isDirectChat = selectedChat.type === 'user';

  const getStatusForUser = (userId: string): Status => {
    if (userId === user?.id) {
      return activeStatus || { userId, isOnline: false };
    }
    return otherStatuses[userId] || { userId, isOnline: false };
  };
  const isOnline = getStatusForUser(selectedChat.userId || selectedChat.id).isOnline;

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
    } else if (selectedChat.memberIds) {
      // Group call logic
      const participantIds = selectedChat.memberIds.filter((id: string) => id !== user?.id);

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
    } else if (selectedChat.memberIds) {

      // console.log(selectedChat)
      // Group call logic
      const participantIds = selectedChat.memberIds.filter((id: string) => id !== user?.id);
      // console.log(participantIds)
      if (participantIds.length > 0) {
        initiateCall('audio', participantIds);
      }
    }

  };

  console.log(selectedChat, "selectedChat")

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
                {selectedChat.memberIds?.length || 'Multiple'} members
              </span>
            ) : (
              <span className="flex items-center">
                <span
                  className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                ></span>
                {isOnline ? 'Online' : 'Offline'}

              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Call Buttons - Show for direct and group with member */}
        {(!isCurrentUser && (isDirectChat || (selectedChat.type === 'group' && selectedChat.memberIds
        ))) && (
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
        <ChatHeaderActions selectedChat={selectedChat} conversationId={selectedChat.id} />
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