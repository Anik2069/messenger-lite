"use client";

import { Suspense } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";

import AuthLoading from "./AuthLoading";
import { ShieldCheck } from "lucide-react";
import { OtpInput } from "../ChatLayout/UserSettings/@privacy/OtpInput";

// 🔹 Schema for OTP form
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function SubmitOtpFormInner() {
  const { handleVerifyAtSignIn, setupLoading, verified, setupError } =
    useAuth();

  const methods = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: OtpFormValues) => {
    await handleVerifyAtSignIn(data.otp);
    reset();
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 border-0 shadow-lg bg-white/90 dark:bg-gray-800/90">
          <div className="flex flex-col items-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              2FA Verification Successful
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You can now access your account securely.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className=" flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Enter Verification Code
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your Authenticator app
            </p>
          </CardHeader>

          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* OTP Input */}
                <OtpInput name="otp" length={6} />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                  disabled={setupLoading}
                >
                  {setupLoading ? "Verifying..." : "Verify Code"}
                </Button>

                {/* Error Message */}
                {setupError && (
                  <p className="text-center text-red-500 text-sm mt-2">
                    Invalid or expired OTP. Please try again.
                  </p>
                )}
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SubmitOtpForm() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <SubmitOtpFormInner />
    </Suspense>
  );
}
