"use client"
import React, { useState } from 'react'
import TopBar from './TopBar/TopBar'
import { demoUser } from '../../../data/demoUser'

const ChatLayout = () => {
    const isConnected = true
    const isDarkMode = false
    const onSettingsClick = () => { }
    const onLogout = () => { }

    const [showSettings, setShowSettings] = useState(false)
    const [showCreateGroup, setShowCreateGroup] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    return (
        <div className='`h-screen flex flex-col bg-gray-50 dark:bg-gray-900'>
            <TopBar
                user={demoUser}
                isConnected={isConnected}
                isDarkMode={isDarkMode}
                onSettingsClick={() => setShowSettings(true)}
                onCreateGroupClick={() => setShowCreateGroup(true)}
                onSearchClick={() => setShowSearch(true)}
                onLogout={onLogout}
            />
        </div>
    )
}

export default ChatLayout
