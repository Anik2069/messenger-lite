"use client"
import React, { useState, useEffect } from 'react'
import { demoUser } from '../../../data/demoUser'
import { users } from '../../../data/userList'
import { demoGroups } from '../../../data/GroupList'
import ChatSidebar from './ChatSidebar/ChatSidebar'
import Navbar from './Navbar/Navbar'
import ChatWindow from './ChatWindow/ChatWindow'
import { Message, FileData, Reaction, ForwardedData } from '../../types/MessageType'
import { Chat } from '../../types/ChatType'
import { demoMessages } from '../../../data/demoMessage'
import { RightSideDrawer } from '../reusable/RightSideDrawer'
import { useGlobalContext } from '@/provider/GlobalContextProvider'

declare global {
    interface Window {
        typingTimeout: NodeJS.Timeout | null;
    }
}

const ChatLayout = () => {
    const [showSettings, setShowSettings] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [user, setUser] = useState(demoUser)
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null)
    const [isConnected, setIsConnected] = useState(true)

    const { newDrawerOpen, newDrawerIsOpen, newDrawerClose, setNewDrawerIsOpen } = useGlobalContext()

    const onChatSelect = (chat: Chat) => {
        setSelectedChat(chat)
        setMessages(demoMessages[chat.id] || [])
        setOtherUserTyping(null)
    }

    const onSendMessage = (
        message: string,
        type: "text" | "file" | "forwarded" = "text",
        fileData?: FileData,
        forwardedFrom?: ForwardedData
    ) => {
        if (!selectedChat) return

        const newMessage: Message = {
            id: Date.now().toString(),
            from: user.username,
            to: selectedChat.id,
            message: message,
            messageType: type,
            fileData: fileData,
            forwardedFrom: forwardedFrom,
            isGroupMessage: selectedChat.type === "group",
            timestamp: new Date(),
            reactions: [],
            readBy: selectedChat.type === "group" ? [
                { username: user.username, timestamp: new Date() }
            ] : []
        }

        setMessages(prev => [...prev, newMessage])
    }

    const onAddReaction = (messageId: string, emoji: string) => {
        setMessages(prevMessages => {
            return prevMessages.map(message => {
                if (message.id !== messageId) return message;

                const existingReactionIndex = message.reactions.findIndex(
                    r => r.username === user.username && r.emoji === emoji
                );

                if (existingReactionIndex >= 0) {
                    return {
                        ...message,
                        reactions: message.reactions.filter(
                            (_, index) => index !== existingReactionIndex
                        )
                    };
                }

                const userReactionIndex = message.reactions.findIndex(
                    r => r.username === user.username
                );

                if (userReactionIndex >= 0) {
                    const updatedReactions = [...message.reactions];
                    updatedReactions[userReactionIndex] = {
                        emoji,
                        username: user.username,
                        timestamp: new Date()
                    };
                    return { ...message, reactions: updatedReactions };
                }

                return {
                    ...message,
                    reactions: [
                        ...message.reactions,
                        {
                            emoji,
                            username: user.username,
                            timestamp: new Date()
                        }
                    ]
                };
            });
        });
    };

    const onTypingStart = () => {
        if (!selectedChat || selectedChat.type !== "user") return;
        if (selectedChat.id === user.id) return;

        setOtherUserTyping(user.username);

        if (window.typingTimeout) {
            clearTimeout(window.typingTimeout);
            window.typingTimeout = null;
        }

        const typingDuration = 1500 + Math.random() * 1500;
        window.typingTimeout = setTimeout(() => {
            setOtherUserTyping(null);
            window.typingTimeout = null;
        }, typingDuration);
    };

    const onTypingStop = () => {
        setOtherUserTyping(null);
        if (window.typingTimeout) {
            clearTimeout(window.typingTimeout);
            window.typingTimeout = null;
        }
    };

    useEffect(() => {
        return () => {
            if (window.typingTimeout) {
                clearTimeout(window.typingTimeout);
                window.typingTimeout = null;
            }
        };
    }, []);

    return (
        <div className="h-screen ">
            <div className='flex flex-col bg-gray-50 dark:bg-gray-900'>
                <Navbar
                    user={user}
                    isConnected={isConnected}
                    onSettingsClick={() => setShowSettings(true)}
                    onSearchClick={() => setShowSearch(true)}
                    onLogout={() => setIsConnected(false)}
                />

                <div className="flex-1 flex overflow-hidden">
                    <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <ChatSidebar
                            users={users}
                            groups={demoGroups}
                            selectedChat={selectedChat}
                            onChatSelect={onChatSelect}
                        />
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
                        <ChatWindow
                            currentUser={user}
                            selectedChat={selectedChat}
                            messages={messages}
                            otherUserTyping={otherUserTyping}
                            onSendMessage={onSendMessage}
                            onAddReaction={onAddReaction}
                            onTypingStart={onTypingStart}
                            onTypingStop={onTypingStop}
                        />
                    </div>
                </div>
            </div>

            <RightSideDrawer isOpen={newDrawerIsOpen} onOpenChange={setNewDrawerIsOpen} title="Sozlamalar" className="w-80">
                <p>Jami</p>
            </RightSideDrawer>
        </div>
    )
}

export default ChatLayout