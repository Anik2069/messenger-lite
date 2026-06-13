import { DummyAvatar } from '@/assets/image';
import ReusableSearchInput from '@/components/reusable/ReusableSearchInput';
import { CardContent, CardHeader } from '@/components/ui/card';
import { MEDIA_HOST } from '@/constant';
import { useFriendsStore } from '@/store/useFriendsStrore';
import { Circle, CircleCheck, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { UserCard, UserCardSkeleton } from '../AddFriend/UserCard';



export const SelectFriends = () => {
    const { friends, friendLoading, fetchFriends, selectedUsers, onAddGroupMember, onRemoveGroupMember } = useFriendsStore();
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchFriends(searchText);
    }, [searchText, fetchFriends]);

    return (
        <>
            <CardHeader className='p-0 space-y-2'>
                <ReusableSearchInput placeholder="Search Users" onDebouncedChange={setSearchText} />

                {selectedUsers.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1 ">
                        {selectedUsers.map(user => (
                            <div key={user.id} className=" flex flex-col items-center gap-1 min-w-[50px] shrink-0 animate-in fade-in zoom-in duration-200">
                                <div className="relative">
                                    <Image
                                        src={user?.avatar ? MEDIA_HOST + '/' + user?.avatar : DummyAvatar}
                                        alt={user?.username || 'User'}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 rounded-full object-contain shrink-0 border-2 border-primary/20"
                                    />
                                    <button
                                        className="absolute -top-1 -right-1 bg-red-300 dark:bg-red-500 rounded-full p-0.5 hover:bg-red-400 dark:hover:bg-red-600 transition-colors cursor-pointer duration-300"
                                        onClick={() => onRemoveGroupMember(user.id)}
                                    >
                                        <X className="w-3 h-3 text-red-600 dark:text-red-200 hover:text-white" />
                                    </button>
                                </div>
                                <span className="text-xs truncate w-14 text-center font-medium">{user.username.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="h-px bg-gray-200 dark:bg-gray-600 w-full "></div>
            </CardHeader>
            <CardContent className='p-0 flex-1 overflow-y-auto scrollbar-none'>
                {
                    friends ? (
                        friends.map((friend) => {
                            const isSelected = selectedUsers.some(u => u.id === friend.id);
                            return (
                                <div key={friend.id} className="space-y-2">
                                    <UserCard
                                        user={friend}
                                        onClick={() => {
                                            if (!isSelected) {
                                                onAddGroupMember(friend);
                                            } else {
                                                onRemoveGroupMember(friend.id);
                                            }
                                        }}
                                        className="cursor-pointer group"
                                        actionContent={
                                            <div
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isSelected) {
                                                        onAddGroupMember(friend);
                                                    } else {
                                                        onRemoveGroupMember(friend.id);
                                                    }
                                                }}
                                            >
                                                {isSelected ? (
                                                    <CircleCheck className={`w-6 h-6 ${isSelected ? 'text-white fill-green-600 dark:text-white dark:fill-green-400' : 'text-primary'}`} />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-muted-foreground" />
                                                )}
                                            </div>
                                        }
                                    />
                                </div>
                            );
                        })
                    ) : friendLoading ? (
                        <div className="space-y-2 pt-2">
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground pt-4">No Friends found</p>
                    )}

                {friends?.length === 0 && (
                    <p className="text-center text-muted-foreground pt-4">No Friends found</p>
                )}

            </CardContent>
        </>
    );
};
