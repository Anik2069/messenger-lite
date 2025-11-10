"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Mail, MessageSquare, Zap } from "lucide-react";
import { InputField } from "../reusable/InputField";
import { FormValues, getSchema } from "@/schema/auth.schema";
import { useAuth } from "@/context/useAuth";
import AuthLoading from "./AuthLoading";
import { SubmitOtpForm } from "./SubmitOtpForm";

// Inner component: এখানে useSearchParams ব্যবহার হচ্ছে
function AuthFormInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "login";
  const [isLogin, setIsLogin] = useState(type === "login");

  useEffect(() => {
    setIsLogin(type === "login");
  }, [type]);

  const {
    login,
    register: registerUser,
    loading,
    is2FAEnabled,
    user,
  } = useAuth();

  const methods = useForm<FormValues>({
    resolver: zodResolver(getSchema(isLogin)),
    defaultValues: { username: "", email: "", password: "" },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: FormValues) => {
    if (isLogin) {
      await login(data.email, data.password);
    } else {
      await registerUser(data.email, data.username!, data.password);
    }
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Messenger Lite</h1>
          </div>
          <p className="text-gray-100 text-sm">
            Fast, simple, and efficient messaging
          </p>
        </div>

        {/* Auth Card */}
        {is2FAEnabled ? (
          <SubmitOtpForm />
        ) : (
          <Card className="shadow-xl border-0 bg-white backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold">
                {isLogin ? "Welcome back" : "Get started"}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isLogin ? "Sign in to continue" : "Create your account"}
              </p>
            </CardHeader>

            <CardContent>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {!isLogin && (
                    <InputField
                      name="username"
                      label="Username"
                      placeholder="Only letters, numbers, _ and ."
                      icon={<User className="w-4 h-4" />}
                    />
                  )}

                  <InputField
                    name="email"
                    label="Email"
                    placeholder="Enter your email"
                    icon={<Mail className="w-4 h-4" />}
                  />

                  <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password (min. 6 characters)"
                    type="password"
                    icon={<Lock className="w-4 h-4" />}
                  />

                  <Button
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                    disabled={loading}
                  >
                    {loading
                      ? "Please wait..."
                      : isLogin
                      ? "Sign In"
                      : "Create Account"}
                  </Button>
                </form>
              </FormProvider>

              <div className="mt-6 text-center">
                <a
                  href={`/auth?type=${isLogin ? "register" : "login"}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="text-gray-100 ">
            <Zap className="w-6 h-6 mx-auto mb-2 animate-pulse" />
            <p className="text-xs">Lightning Fast</p>
          </div>
          <div className="text-gray-100 ">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 animate-pulse " />
            <p className="text-xs">Real-time Chat</p>
          </div>
          <div className="text-gray-100 ">
            <User className="w-6 h-6 mx-auto mb-2 animate-pulse" />
            <p className="text-xs">Simple & Clean</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthForm() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthFormInner />
    </Suspense>
  );
}
