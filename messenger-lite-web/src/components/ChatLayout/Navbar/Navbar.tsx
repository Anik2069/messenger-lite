import React from 'react'
import { User } from '../../../../types/UserType'
import { LogOut, MessageSquare, Plus, Search, Settings, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'

interface NavbarProps {
    user: User
    isConnected: boolean
    onSettingsClick: () => void
    onCreateGroupClick: () => void
    onSearchClick: () => void
    onLogout: () => void
}

const Navbar = ({
    user,
    isConnected,
    onSettingsClick,
    onCreateGroupClick,
    onSearchClick,
    onLogout,
}: NavbarProps) => {
    return (
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
            {/* Left side - Brand */}
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Messenger Lite</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.username}</p>
                </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2">
                {/* Connection Status */}
                <div
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${isConnected
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                >
                    {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <span>{isConnected ? "Online" : "Offline"}</span>
                </div>

                {/* Action Buttons */}
                <Button variant="ghost" size="sm" onClick={onSearchClick}>
                    <Search className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={onCreateGroupClick}>
                    <Plus className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={onSettingsClick}>
                    <Settings className="w-4 h-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4" />
                </Button>

                {/* User Avatar */}
                <div
                    className={`w-8 h-8 ${user?.avatar} rounded-full flex items-center justify-center text-white text-sm font-medium`}
                >
                    {getInitials(user?.username)}
                </div>
            </div>
        </div>
    )
}

export default Navbar
