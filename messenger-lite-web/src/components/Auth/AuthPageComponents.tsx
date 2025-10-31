"use client";

import React from "react";
import { useAuth } from "@/context/useAuth";
import { AuthForm } from "./AuthForm";
import { Spinner } from "../ui/Spinner";
import MessengerLiteCover from "./MessengerLiteCover";

export const AuthPageComponents = () => {
  const { user, initialLoading } = useAuth();

  if (initialLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  // if (user)
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white text-center pt-20">
  //       Welcome, {user.username}!
  //     </div>
  //   );
  // return <MessengerLiteCover />;
  // return null;

  return <AuthForm />;
};
