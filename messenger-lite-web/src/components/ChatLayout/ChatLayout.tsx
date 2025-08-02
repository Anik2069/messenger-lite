"use client"
import React, { useState } from 'react'
import TopBar from './TopBar/TopBar'
import { demoUser } from '../../../data/demoUser'
import { users } from '../../../data/userList'
import { demoGroups } from '../../../data/GroupList'
import ChatSidebar from './ChatSidebar/ChatSidebar'

const ChatLayout = () => {
    const isConnected = true
    const onSettingsClick = () => { }
    const onLogout = () => { }

    const [showSettings, setShowSettings] = useState(false)
    const [showCreateGroup, setShowCreateGroup] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    const onChatSelect = () => { }

    return (
        <div className='`h-screen flex flex-col bg-gray-50 dark:bg-gray-900'>
            <TopBar
                user={demoUser}
                isConnected={isConnected}

                onSettingsClick={() => setShowSettings(true)}
                onCreateGroupClick={() => setShowCreateGroup(true)}
                onSearchClick={() => setShowSearch(true)}
                onLogout={onLogout}
            />

            <div className="flex-1 flex overflow-hidden">
                <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <ChatSidebar
                        users={users}
                        groups={demoGroups}
                        selectedChat={null}
                        onChatSelect={onChatSelect}
                    />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-900"></div>
            </div>
        </div>
    )
}

export default ChatLayout
