"use client";

import React, { useEffect } from "react";
import ChatLayout from "@/components/ChatLayout/ChatLayout";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/useAuth";

const ChatLayoutPage = () => {
  const { user, loading, isLogoutLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(user, "from useEffect");
    if (user === null || (user === undefined && !isLogoutLoading && !loading)) {
      router.push("/auth?type=login");
    } else {
      router.push("/");
    }
  }, [user, router, loading, isLogoutLoading]);
  if (isLogoutLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black/15">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="">
      {loading && (
        <div className="flex items-center justify-center h-screen bg-black/15">
          <Spinner />
        </div>
      )}
      {user && <ChatLayout />}
    </div>
  );
};

export default ChatLayoutPage;
