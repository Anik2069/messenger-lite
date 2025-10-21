"use client";
import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/useAuth";
import { SocketContextProvider } from "@/context/useSocket";
import { GlobalContextProvider } from "@/provider/GlobalContextProvider";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <AuthProvider>
        <SocketContextProvider>
          <SettingsProvider>
            {" "}
            <GlobalContextProvider>{children}</GlobalContextProvider>
          </SettingsProvider>
        </SocketContextProvider>
      </AuthProvider>
    </div>
  );
};

export default layout;
