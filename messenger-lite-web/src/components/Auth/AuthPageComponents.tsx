"use client";
import React from "react";
import { AuthForm } from "./AuthForm";
import { useAuth } from "@/context/useAuth";
import { SubmitOtpForm } from "./SubmitOtpForm";

const AuthPageComponents = () => {
  const { user } = useAuth();
  return <div>{!user && <AuthForm />}</div>;
};

export default AuthPageComponents;
