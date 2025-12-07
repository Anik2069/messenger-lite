"use client"
import { useChatStore } from '@/store/useChatStore'
import React, { useEffect } from 'react'
import FileMessage from '../ChatWindow/FileMessage'

const ShowMedia = ({selectedChat}: {selectedChat: any}) => {
    const {fetchConversationsMedia, selectedMedia} = useChatStore()

    useEffect(() => {
        if (selectedChat) {
            fetchConversationsMedia(selectedChat.id)
        }
    }, [selectedChat])
  return (
    <div className='flex flex-col gap-2'>
        {selectedMedia?.map((media: any, index: number) => (
            <div key={index} className='mt-2'>
                <FileMessage file={media} />
            </div>
        ))}
    </div>
  )
}

export default ShowMedia