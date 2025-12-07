"use client"
import { useChatStore } from '@/store/useChatStore'
import React, { useEffect } from 'react'
import FileMessage from '../ChatWindow/FileMessage'

const ShowMedia = ({ selectedChat }: { selectedChat: any }) => {
    const { fetchConversationsMedia, selectedMedia } = useChatStore()

    useEffect(() => {
        if (selectedChat) {
            fetchConversationsMedia(selectedChat.id)
        }
    }, [selectedChat])
    return (
        <div className='grid grid-cols-3 gap-2'>
            {selectedMedia?.map((media: any, index: number) => (
                <div key={index} className=''>
                    <FileMessage className='!w-20 !h-20 mx-auto' file={media} />
                </div>
            ))}
        </div>
    )
}

export default ShowMedia