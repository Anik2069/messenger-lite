// app/chat/page.tsx (or wherever your route is)

"use client";

import React, { useEffect } from "react";
import ChatLayout from "@/components/ChatLayout/ChatLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

const ChatLayoutPage = () => {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    console.log(user, "from useEffect");
    if (user === null || user === undefined) {
      router.push("/auth?type=login");
    } else {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="w-full h-full">
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
