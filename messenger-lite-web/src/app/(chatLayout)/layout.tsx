"use client";
import { AuthProvider } from "@/context/useAuth";
import { GlobalContextProvider } from "@/provider/GlobalContextProvider";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <GlobalContextProvider>
        <AuthProvider>{children}</AuthProvider>
      </GlobalContextProvider>
    </div>
  );
};

export default layout;
