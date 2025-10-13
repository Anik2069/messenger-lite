"use client";
import React from "react";
import { AuthForm } from "./AuthForm";
import { useAuth } from "@/context/useAuth";
import { SubmitOtpForm } from "./SubmitOtpForm";

const AuthPageComponents = () => {
  const { is2FAEnabled } = useAuth();
  return <div>{is2FAEnabled ? <SubmitOtpForm /> : <AuthForm />}</div>;
};

export default AuthPageComponents;
