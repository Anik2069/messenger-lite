"use client";
import { AuthProvider } from "@/context/useAuth";
import { SocketContextProvider } from "@/context/useSocket";
import { GlobalContextProvider } from "@/provider/GlobalContextProvider";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <GlobalContextProvider>
        <AuthProvider>
          <SocketContextProvider>{children}</SocketContextProvider>
        </AuthProvider>
      </GlobalContextProvider>
    </div>
  );
};

export default layout;
