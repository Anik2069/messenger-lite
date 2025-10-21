"use client";

import { Suspense } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import Modal from "./Modal";
import { OtpInput } from "../ChatLayout/UserSettings/@privacy/OtpInput";
import AuthLoading from "../Auth/AuthLoading";

// ✅ Validation Schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface VerifyModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void> | void;
  loading?: boolean;
  title?: string;
  description?: string;
}

function VerifyModalInner({
  open,
  onClose,
  onVerify,
  loading,
  title = "Verify Account",
  description = "Enter the 6-digit code from your Authenticator app",
}: VerifyModalProps) {
  const { verified, setupError } = useAuth();

  const methods = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: OtpFormValues) => {
    await onVerify(data.otp);
    reset();
  };

  const onCloseModal = () => {
    onClose();
    reset();
  };

  return (
    <Modal title={title} open={open} onClose={onCloseModal}>
      <Card className="!p-0 border-none shadow-none !mx-0 gap-0 bg-inherit">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {"Enter Verification Code"}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </CardHeader>

        <CardContent className="p-0">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Input */}
              <OtpInput name="otp" length={6} setupError={setupError} />
              {setupError && (
                <p className="text-center text-red-500 text-sm mt-2">
                  Invalid or expired OTP. Please try again.
                </p>
              )}
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              {/* Error Message */}
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </Modal>
  );
}

export function VerifyModal(props: VerifyModalProps) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <VerifyModalInner {...props} />
    </Suspense>
  );
}
