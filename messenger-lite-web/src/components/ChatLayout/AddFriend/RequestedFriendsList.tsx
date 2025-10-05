"use client";

import { DummyAvatar } from "@/assets/image";
import { Button } from "@/components/ui/button";
import { useFriendsStore } from "@/store/useFriendsStrore";
import Image from "next/image";
import React, { useEffect } from "react";
import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  format,
  formatDistanceToNow,
} from "date-fns";

const RequestedFriendsList = () => {
  const {
    error: friendsError,
    activeTab,
    searchText,
    pendingRequestsLIst,
    getPendingRequestsLIst,
    pendingRequestsLIstLoading,
  } = useFriendsStore();

  useEffect(() => {
    getPendingRequestsLIst(searchText);
  }, [searchText, getPendingRequestsLIst, activeTab]);

  if (pendingRequestsLIstLoading)
    return <p className="text-center text-sm text-gray-500">Loading...</p>;

  if (friendsError)
    return (
      <p className="text-center text-sm text-red-500">
        Failed to load requested users
      </p>
    );

  if (!pendingRequestsLIst?.length)
    return (
      <p className="text-center text-sm text-gray-500">
        You haven’t sent any friend requests yet.
      </p>
    );

  const formatSocialTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();

    const minutesAgo = differenceInMinutes(now, date);
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`; // minutes

    const hoursAgo = differenceInHours(now, date);
    if (hoursAgo < 24) return `${hoursAgo}h ago`; // hours

    const daysAgo = differenceInDays(now, date);
    if (daysAgo < 7) return `${daysAgo}d ago`; // days

    const weeksAgo = differenceInWeeks(now, date);
    if (weeksAgo < 4) return `${weeksAgo}w ago`; // weeks

    // older than 4 weeks, fallback to month + day
    return format(date, "MMM d");
  };

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {pendingRequestsLIst.map((userInfo) => (
        <div
          key={userInfo?.id}
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          {/* Avatar + Info */}
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src={userInfo?.avatar || DummyAvatar}
              alt={userInfo?.username}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {userInfo?.username}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                10 mutual friends
              </p>
            </div>
          </div>

          {/* Social-style Time */}
          {userInfo?.requestCreatedAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-auto">
              {formatSocialTime(userInfo?.requestCreatedAt)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default RequestedFriendsList;
