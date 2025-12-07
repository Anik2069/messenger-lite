"use client"
import { useChatStore } from '@/store/useChatStore'
import React, { useEffect } from 'react'
import FileMessage from '../ChatWindow/FileMessage'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShowMedia = ({ selectedChat }: { selectedChat: any }) => {
    const { fetchConversationsMedia, selectedMedia } = useChatStore()

    useEffect(() => {
        if (selectedChat) {
            fetchConversationsMedia(selectedChat.id)
        }
    }, [selectedChat, fetchConversationsMedia])
    return (
        <div className='grid grid-cols-3 gap-2'>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {selectedMedia?.map((media: any, index: number) => (
                <div key={index} className=''>
                    <FileMessage className='!w-20 !h-20 mx-auto' file={media} />
                </div>
            ))}
        </div>
    )
}

export default ShowMedia