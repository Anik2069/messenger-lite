"use client";
import { DummyAvatar } from "@/assets/image";
import ReusableSearchInput from "@/components/reusable/ReusableSearchInput";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendsStore } from "@/store/useFriendsStrore";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const AddFriend = () => {
  const [searchText, setSearchText] = useState<string>("");
  const {
    suggestedFriends,
    getSuggestedFriends,
    suggestedFriendsLoading,
    error: friendsError,
  } = useFriendsStore();

  useEffect(() => {
    getSuggestedFriends(searchText);
  }, [searchText, getSuggestedFriends]);
  return (
    <div className="">
      <Tabs defaultValue="suggestion" className="p-4">
        <TabsList className="w-full ">
          <TabsTrigger value="suggestion">Suggestion</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <ReusableSearchInput
            placeholder="Search Name"
            onDebouncedChange={setSearchText}
          />
        </div>
        <TabsContent value="suggestion">
          <div className="">
            {suggestedFriends?.map((userInfo) => {
              return (
                <div
                  key={userInfo?.id}
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors `}
                >
                  <div className="relative mr-3">
                    <Image
                      src={userInfo?.avatar || DummyAvatar}
                      alt={userInfo?.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover cursor-pointer "
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex justify-between">
                    <div className="">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate cursor-pointer w-fit">
                        {userInfo?.username}
                      </h3>
                      <p
                        className={`text-xs truncate text-gray-500 dark:text-gray-400 
                  `}
                      >
                        10 mutual friends
                      </p>
                    </div>
                    <div className="my-auto">
                      <Button
                        className="cursor-pointer"
                        size={"sm"}
                        variant={"default"}
                      >
                        Add Friend
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="request">
          <div className="">
            {suggestedFriends?.map((userInfo) => {
              return (
                <div
                  key={userInfo?.id}
                  className={`flex items-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors `}
                >
                  <div className="relative mr-3">
                    <Image
                      src={userInfo?.avatar || DummyAvatar}
                      alt={userInfo?.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover cursor-pointer mt-1"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate cursor-pointer w-fit">
                        {userInfo?.username}
                      </h3>
                      <p
                        className={`text-xs truncate text-gray-500 dark:text-gray-400 
                  `}
                      >
                        10 mutual friends
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="cursor-pointer"
                        size={"sm"}
                        variant={"default"}
                      >
                        Confirm
                      </Button>
                      <Button
                        className="cursor-pointer"
                        size={"sm"}
                        variant={"outline"}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="pending">
          <div className="">Pending</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddFriend;
