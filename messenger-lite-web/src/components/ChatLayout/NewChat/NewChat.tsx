"use client";
// import { DummyAvatar, dummyGroupAvatar } from "@/assets/image";
// import NewActionButton from "@/components/reusable/NewActionButton";
import ReusableSearchInput from "@/components/reusable/ReusableSearchInput";
import React, { useState } from "react";
import AllContacts from "./AllContacts/AllContacts";
import { Chat } from "@/types/ChatType";

const NewChat = ({ onChatSelect }: { onChatSelect: (chat: Chat) => void }) => {
  const [searchText, setSearchText] = useState<string>("");
  return (
    <div className="  ">
      <div className="p-4">
        <ReusableSearchInput
          placeholder="Search Name"
          onDebouncedChange={setSearchText}
        />
      </div>
      {/* <div className="">
        <NewActionButton
          label="New Group"
          avatarSrc={dummyGroupAvatar.src}
          onClick={() => {}}
        />
      </div> */}
      <div className="">
        {/* <NewActionButton
          label="New Chat"
          avatarSrc={DummyAvatar.src}
          onClick={() => {}}
        /> */}
      </div>
      <div className="">
        <AllContacts searchText={searchText} onChatSelect={onChatSelect} />
      </div>
    </div>
  );
};

export default NewChat;
