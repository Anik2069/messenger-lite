/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { User } from '../../../../types/UserType'
import { Chat } from '../../../../types/ChatType'
import { Message } from '../../../../types/MessageType'


interface ChatWindowProps {
    currentUser: User
    selectedChat: Chat | null
    messages: Message[]
    otherUserTyping: string | null
    onSendMessage: (message: string, type?: "text" | "file" | "forwarded", fileData?: any, forwardedFrom?: any) => void
    onAddReaction: (messageId: string, emoji: string) => void
    onTypingStart: () => void
    onTypingStop: () => void

}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"]


const ChatWindow = ({ currentUser, selectedChat, messages, otherUserTyping, onSendMessage, onAddReaction, onTypingStart, onTypingStop }: ChatWindowProps) => {


    return (
        <div>

        </div>
    )
}

export default ChatWindow
