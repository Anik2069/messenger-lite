import { create } from 'zustand';
import axiosInstance from '@/config/axiosInstance';
import { socket } from '@/lib/socket';
import { uuidv4 } from '@/lib/utils';
import { Chat } from '@/types/ChatType';
import { FileData, ForwardedData, Message, MessageKind } from '@/types/MessageType';
import { toServerType } from '@/types/sendMessage';
import { toast } from 'react-toastify';
import { HOST } from '@/constant';
import { useConversationStore } from './useConversationStore';
import { User } from '@/types/UserType';

interface ServerMessage {
  id: string;
  clientTempId?: string;
  conversationId: string;
  author?: { id: string; username?: string };
  authorId?: string;
  conversation?: { name?: string; type?: string };
  message?: string;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
  fileData?: object;
  forwardedFrom?: string;
  createdAt?: string | number | Date;
  callLog?: any;
  reactions?: Array<{
    emoji: string;
    user?: { username?: string };
    userId?: string;
    createdAt?: string | number | Date;
  }>;
  receipts?: Array<{
    user?: { username?: string };
    userId?: string;
    readAt?: string | number | Date;
  }>;
}

export type ChatState = {
  selectedChat: Chat | null;
  messages: Message[];
  otherUserTyping: string | null;
  isConnected: boolean;
  showSearch: boolean;
  selectedUserInfo: User | null;
  selectedGroupInfo: Record<string, any> | null;
  selectedMedia: any[];
  isLoadingMedia: boolean;
  sentTempIds: string[];

  messageCursor: string | null;
  hasMoreMessages: boolean;
  isLoadingMessages: boolean;

  setSelectedChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  setOtherUserTyping: (username: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setShowSearch: (show: boolean) => void;
  setSelectedUserInfo: () => void;
  setSelectedGroupInfo: (data: Record<string, any>) => void;
  resetPagination: () => void;
  handleCloseChat: () => void;

  emitTyping: (user: { username: string }) => void;
  onSendMessage: (
    text: string,
    type?: 'TEXT' | 'FILE' | 'forwarded' | 'VOICE',
    fileData?: object,
    voiceUrl?: string,
    forwardedFrom?: ForwardedData,
    currentUser?: { username: string; id: string } | null,
    isOpenSelectedChatProfile?: boolean
  ) => Promise<void>;
  onAddReaction: (
    messageId: string,
    emoji: string,
    currentUser?: { username: string; id: string } | null
  ) => Promise<void>;
  handleClearConversation: (conversationId: string) => void;
  handleFetchUsersInfo: (id: string) => void;
  handleFetchGroupInfo: (id: string) => void;
  loadMoreMessages: () => Promise<void>;
  fetchConversationsMedia: (id: string) => void;
};

function mapServerMessage(raw: ServerMessage): Message {
  return {
    id: raw.id,
    clientTempId: raw.clientTempId,
    conversationId: raw.conversationId,
    from: {
      id: raw.author?.id ?? raw.authorId ?? '',
      username: raw.author?.username ?? 'Unknown',
    },
    to: {
      id: raw.conversationId,
      username: raw.conversation?.name ?? '',
    },
    message: raw.message ?? '',
    messageType: (raw.messageType ?? 'TEXT') as MessageKind,
    fileData: raw.fileUrl
      ? {
        url: raw.fileUrl,
        filename: raw.fileName ?? '',
        originalName: raw.fileName ?? '',
        mimetype: raw.fileMime ?? '',
        size: raw.fileSize ?? 0,
      }
      : undefined,
    forwardedFrom: raw.forwardedFrom
      ? { originalSender: raw.forwardedFrom }
      : undefined,
    isGroupMessage: raw.conversation?.type === 'GROUP',
    timestamp: new Date(raw.createdAt ?? Date.now()),
    callLog: raw.callLog,
    reactions: (raw.reactions ?? []).map((r) => ({
      emoji: r.emoji,
      username: r.user?.username ?? r.userId ?? '',
      userId: r.userId,
      timestamp: new Date(r.createdAt ?? Date.now()),
    })),
    readBy: (raw.receipts ?? []).map((rc) => ({
      username: rc.user?.username ?? rc.userId ?? '',
      userId: rc.userId,
      timestamp: new Date(rc.readAt ?? Date.now()),
    })),
  };
}

function belongsToSelectedChat(
  msg: Message,
  selectedChat: Chat | null,
  sentTempIds: string[]
): boolean {
  if (!selectedChat) return false;

  // If we sent this message (matched by our temp ID), it always belongs here
  const isOwnMessage = msg.clientTempId
    ? sentTempIds.includes(msg.clientTempId)
    : false;

  if (isOwnMessage) return true;

  // Match by conversation ID (groups and direct messages with conversation record)
  if (msg.conversationId === selectedChat.id) return true;

  if (
    selectedChat.type === 'user' &&
    !msg.isGroupMessage &&
    (msg.from.id === selectedChat.id || msg.from.id === selectedChat.userId)
  ) {
    return true;
  }

  return false;
}

function mergeIncomingMessage(messages: Message[], incoming: Message): Message[] {
  if (incoming.clientTempId) {
    const optimisticIndex = messages.findIndex(
      (m) =>
        m.clientTempId === incoming.clientTempId &&
        m.messageType === incoming.messageType &&
        (m.fileData as FileData)?.url === (incoming.fileData as FileData)?.url
    );

    if (optimisticIndex !== -1) {
      return messages.map((m, i) => (i === optimisticIndex ? incoming : m));
    }
  }

  if (messages.some((m) => m.id === incoming.id)) {
    return messages;
  }

  return [...messages, incoming];
}

let socketListenersRegistered = false;

function registerSocketListeners(
  get: () => ChatState,
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void
) {
  if (socketListenersRegistered) return;
  socketListenersRegistered = true;

  socket.off('receive_message');
  socket.off('user_typing');
  socket.off('message_reaction');

  socket.on('receive_message', (raw: unknown) => {
    const incoming = mapServerMessage(raw as ServerMessage);

    set((state) => {
      if (!belongsToSelectedChat(incoming, state.selectedChat, state.sentTempIds)) {
        return state;
      }

      return { messages: mergeIncomingMessage(state.messages, incoming) };
    });
  });

  socket.on('user_typing', (data: { conversationId: string; username?: string }) => {
    const { selectedChat } = get();
    if (selectedChat?.id === data.conversationId) {
      set({ otherUserTyping: data.username ?? null });
    }
  });

  socket.on('message_reaction', (payload: {
    messageId: string;
    emoji: string;
    action: 'added' | 'removed';
    username?: string;
    userId?: string;
    timestamp?: string;
  }) => {
    const actor = payload.username ?? payload.userId ?? 'Unknown';

    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id !== payload.messageId) return msg;

        if (payload.action === 'removed') {
          return {
            ...msg,
            reactions: msg.reactions.filter(
              (r) => !(r.emoji === payload.emoji && r.username === actor)
            ),
          };
        }

        return {
          ...msg,
          reactions: [
            ...msg.reactions,
            {
              emoji: payload.emoji,
              username: actor,
              timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
            },
          ],
        };
      }),
    }));
  });
}

export const useChatStore = create<ChatState>((set, get) => {
  registerSocketListeners(get, set);

  return {
    selectedChat: null,
    messages: [],
    sentTempIds: [],
    otherUserTyping: null,
    isConnected: socket.connected,
    showSearch: false,
    selectedUserInfo: null,
    selectedGroupInfo: null,
    selectedMedia: [],
    isLoadingMedia: false,
    messageCursor: null,
    hasMoreMessages: false,
    isLoadingMessages: false,

    setSelectedChat: (chat) => set({ selectedChat: chat }),
    setMessages: (messages) => set({ messages }),
    setOtherUserTyping: (username) => set({ otherUserTyping: username }),
    setIsConnected: (connected) => set({ isConnected: connected }),
    setShowSearch: (show) => set({ showSearch: show }),
    setSelectedUserInfo: () => set({ selectedChat: null }),
    setSelectedGroupInfo: (data) => set({ selectedGroupInfo: data }),
    handleCloseChat: () => set({ selectedChat: null }),
    resetPagination: () =>
      set({ messageCursor: null, hasMoreMessages: false, isLoadingMessages: false }),

    emitTyping: ({ username }) => {
      const { selectedChat } = get();
      if (!selectedChat) return;

      socket.emit('typing', {
        conversationId: selectedChat.id,
        username,
      });
    },

    onSendMessage: async (
      text,
      type = 'TEXT',
      fileData,
      voiceUrl,
      forwardedFrom,
      currentUser,
      isOpenSelectedChatProfile
    ) => {
      const { selectedChat, fetchConversationsMedia } = get();
      if (!selectedChat || !currentUser) return;

      const clientTempId = uuidv4();
      set((state) => ({ sentTempIds: [...state.sentTempIds, clientTempId] }));

      const formData = new FormData();
      formData.append('conversationId', selectedChat.id);
      formData.append('message', text ?? '');
      formData.append('messageType', toServerType(type));
      formData.append('clientTempId', clientTempId);

      if (selectedChat.type === 'user') {
        formData.append('recipientId', selectedChat.id);
      }
      if (forwardedFrom) {
        formData.append('forwardedFrom', forwardedFrom.originalSender);
      }
      if (fileData) {
        const files = Array.isArray(fileData) ? fileData : [fileData];
        files.forEach((file) => formData.append('files', file as unknown as Blob));
      }
      if (voiceUrl) {
        try {
          const blob = await fetch(voiceUrl).then((res) => res.blob());
          formData.append('files', blob, 'voice-message.wav');
        } catch {
          console.error('Failed to convert voice URL to blob');
        }
      }

      try {
        const res = await axiosInstance.post('messages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const saved = res.data?.results;

        // If the media panel is open, refresh its content after a file send
        if (saved && isOpenSelectedChatProfile) {
          const conversationId = saved?.conversation?.id ?? saved?.[0]?.conversation?.id;
          if (conversationId) {
            fetchConversationsMedia(conversationId);
          }
        }
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        const serverMessage = apiError?.response?.data?.message;
        toast.error(serverMessage ?? 'Failed to send message');
      }
    },

    // ── Toggle / add an emoji reaction on a message ─
    onAddReaction: async (messageId, emoji) => {
      try {
        await axiosInstance.post(`reactions/${messageId}/reactions`, { emoji });
      } catch {
        console.error('Failed to add reaction');
      }
    },

    // ── Delete all messages in the current conversation ─
    handleClearConversation: async (conversationId) => {
      try {
        const response = await axiosInstance.delete(
          `${HOST}/messages/clear/${conversationId}`
        );

        if (response.status === 200) {
          set({ messages: [] });
          useConversationStore.getState().clearConversations(conversationId);
        }
      } catch (error) {
        console.error('Failed to clear conversation', error);
      }
    },

    // ── Fetch profile info for the other user in a DM ─
    handleFetchUsersInfo: async (id) => {
      try {
        const response = await axiosInstance.get(`${HOST}/auth/user/${id}`);
        set({ selectedUserInfo: response.data?.results });
      } catch (error) {
        console.error('Failed to fetch user info', error);
      }
    },

    // ── Fetch metadata for a group conversation ─
    handleFetchGroupInfo: async (id) => {
      try {
        const response = await axiosInstance.get(`${HOST}/group/group-info/${id}`);
        set({ selectedGroupInfo: response.data?.results });
      } catch (error) {
        console.error('Failed to fetch group info', error);
      }
    },

    // ── Paginate: load older messages above the current view ─
    loadMoreMessages: async () => {
      const { selectedChat, messageCursor, hasMoreMessages, isLoadingMessages, messages } = get();

      if (!selectedChat || isLoadingMessages || !hasMoreMessages) return;

      set({ isLoadingMessages: true });

      try {
        const url = messageCursor
          ? `messages/${selectedChat.id}?cursor=${messageCursor}`
          : `messages/${selectedChat.id}`;

        const response = await axiosInstance.get(url);
        const data = response.data?.results ?? response.data?.data ?? {};

        const olderMessages: Message[] = data.messages ?? [];
        const nextCursor: string | null = data.nextCursor ?? null;
        const hasMore: boolean = data.hasMore ?? false;

        // Prepend older messages, skipping any that are already in state
        const existingIds = new Set(messages.map((m) => m.id));
        const uniqueOlder = olderMessages.filter((m) => !existingIds.has(m.id));

        set({
          messages: [...uniqueOlder, ...messages],
          messageCursor: nextCursor,
          hasMoreMessages: hasMore,
          isLoadingMessages: false,
        });
      } catch (error) {
        console.error('Failed to load older messages', error);
        set({ isLoadingMessages: false });
      }
    },

    // ── Fetch all media files shared in a conversation ─
    fetchConversationsMedia: async (id) => {
      set({ isLoadingMedia: true });

      try {
        const response = await axiosInstance.get(`${HOST}/messages/${id}/media`);

        if (response.status === 200) {
          set({
            selectedMedia: response.data?.results?.media ?? [],
            isLoadingMedia: false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch conversation media', error);
        set({ selectedMedia: [], isLoadingMedia: false });
      }
    },
  };
});