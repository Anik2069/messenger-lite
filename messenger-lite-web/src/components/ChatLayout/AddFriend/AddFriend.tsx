"use client";
import { DummyAvatar } from "@/assets/image";
import ReusableSearchInput from "@/components/reusable/ReusableSearchInput";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendsStore } from "@/store/useFriendsStrore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import SuggestedFriendList from "./SuggestedFriendList";
import RequestedFriendsList from "./RequestedFriendsList";
import RequestFriendsList from "./RequestFriendsList";
import { set } from "zod";

const AddFriend = ({
  isAddFriendModalOpen,
}: {
  isAddFriendModalOpen: boolean;
}) => {
  const { activeTab, setActiveTab, setSearchText } = useFriendsStore();

  useEffect(() => {
    setActiveTab("request");
  }, [setActiveTab, isAddFriendModalOpen]);
  return (
    <div className="">
      <Tabs
        defaultValue={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        className="p-4"
      >
        <TabsList className="w-full ">
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="suggestion">Suggestion</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        <div className="mt-2">
          <ReusableSearchInput
            placeholder="Search Name"
            onDebouncedChange={setSearchText}
          />
        </div>
        <TabsContent value="suggestion">
          <SuggestedFriendList />
        </TabsContent>
        <TabsContent value="request">
          <RequestFriendsList />
        </TabsContent>
        <TabsContent value="pending">
          <div className="">
            <RequestedFriendsList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddFriend;
