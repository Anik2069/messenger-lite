import React, { useState } from 'react'
import { User } from '../../../../types/UserType'
import { Group } from '../../../../types/GroupType'
import { Chat } from '../../../../types/ChatType'
import { Hash, MessageCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getInitials } from '@/lib/utils'
import Image from 'next/image'
import { DummyAvatar, dummyGroupAvatar } from '@/assets/image'
interface ChatSidebarProps {
    users: User[]
    groups: Group[]
    selectedChat: Chat | null
    onChatSelect: (chat: Chat) => void
}
const ChatSidebar = ({ users, groups, selectedChat, onChatSelect }: ChatSidebarProps) => {
    const [searchQuery, setSearchQuery] = useState("")
    const filteredUsers = users.filter((user) => user?.username.toLowerCase().includes(searchQuery.toLowerCase()))
    const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleChatSelect = (type: "user" | "group", id: string, name: string, avatar?: string, isOnline?: boolean) => {
        onChatSelect({ type, id, name, avatar, isOnline })
    }


    return (
        <div className="h-full flex flex-col  max-h-[100vh] " >
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-gray-50 dark:bg-gray-700 border-0 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
                {/* Groups */}
                {filteredGroups.length > 0 && (
                    <div>
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800">
                            Groups
                        </div>
                        {filteredGroups.map((group) => (
                            <div
                                key={group._id}
                                onClick={() => handleChatSelect("group", group._id, group.name, group.avatar)}
                                className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${selectedChat?.type === "group" && selectedChat?.id === group._id
                                    ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500"
                                    : ""
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3`}
                                >
                                    <Image
                                        src={dummyGroupAvatar}
                                        alt={group?.name}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <Hash className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{group.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{group.members.length} members</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Users */}
                <div>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800">
                        Contacts
                    </div>
                    {filteredUsers.map((user) => (
                        <div
                            key={user?.username}
                            onClick={() => handleChatSelect("user", user?.username, user?.username, user?.avatar, user.isOnline)}
                            className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${selectedChat?.type === "user" && selectedChat?.id === user?.username
                                ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500"
                                : ""
                                }`}
                        >
                            <div className="relative">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3`}
                                >
                                    <div className="">
                                        <Image
                                            src={DummyAvatar}
                                            alt={user?.username}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </div>
                                    {getInitials(user?.username)}
                                </div>
                                <div
                                    className={`absolute bottom-0 right-2 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${user.isOnline ? "bg-green-400" : "bg-gray-400"
                                        }`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">{user?.username}</h3>
                                <p
                                    className={`text-sm truncate ${user.isOnline ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    {user.isOnline ? "Online" : "Offline"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredUsers.length === 0 && filteredGroups.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                        <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">No conversations found</p>
                        {searchQuery && <p className="text-xs mt-1">Try a different search term</p>}
                    </div>
                )}
            </div>
        </div >
    )
}

export default ChatSidebar
