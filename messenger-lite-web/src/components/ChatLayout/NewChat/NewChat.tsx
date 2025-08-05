"use client"
import { DummyAvatar, dummyGroupAvatar } from '@/assets/image'
import NewActionButton from '@/components/reusable/NewActionButton'
import ReusableSearchInput from '@/components/reusable/ReusableSearchInput'
import React, { useState } from 'react'
import AllContacts from './AllContacts/AllContacts'

const NewChat = () => {
    const [searchText, setSearchText] = useState<string>("")
    return (
        <div className='space-y-2'>
            <div className="">
                <ReusableSearchInput placeholder="Search Name" onDebouncedChange={setSearchText} />
            </div>
            <div className="">
                <NewActionButton label="New Group" avatarSrc={dummyGroupAvatar.src} onClick={() => { }} />
            </div>
            <div className="">
                <NewActionButton label="New Chat" avatarSrc={DummyAvatar.src} onClick={() => { }} />
            </div>
            <div className="">
                <AllContacts searchText={searchText} />
            </div>
        </div>
    )
}

export default NewChat
