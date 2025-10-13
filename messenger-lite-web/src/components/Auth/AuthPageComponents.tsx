"use client";
import React from "react";
import { AuthForm } from "./AuthForm";
import { useAuth } from "@/context/useAuth";
import { SubmitOtpForm } from "./SubmitOtpForm";
import Loading from "@/app/loading";

const AuthPageComponents = () => {
  const { is2FAEnabled, loading } = useAuth();

  return (
    <div>
      {loading ? <Loading /> : is2FAEnabled ? <SubmitOtpForm /> : <AuthForm />}
    </div>
  );
};

export default AuthPageComponents;
