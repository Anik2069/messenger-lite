"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { useForm, FormProvider } from "react-hook-form";
import { OtpInput } from "./OtpInput";

const TwoFactorAuth = () => {
  const {
    setupLoading,
    setUp2FA,
    qr,
    secret,
    handleVerify,
    verified,
    currentUserDetails,
    setSetupError,
  } = useAuth();

  const methods = useForm<{ otp: string }>({ defaultValues: { otp: "" } });
  const { watch } = methods;
  const otpValue = watch("otp");

  const onVerify = async () => {
    setSetupError(false);
    await handleVerify(otpValue); // pass the OTP value from the form
  };

  return (
    <div className="border rounded-xl p-4 border-gray-200 dark:border-gray-700 pb-4">
      <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Secure your account by enabling two-factor authentication using Google
        Authenticator or similar apps.
      </p>

      {currentUserDetails?.isTwoFAEnable === true ? (
        <div className="">
          <p className="text-green-600 font-semibold mt-2">
            2FA is already enabled for your account!
          </p>
        </div>
      ) : (
        <Button
          disabled={setupLoading}
          onClick={() => setUp2FA()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Setup 2FA
        </Button>
      )}

      {currentUserDetails?.isTwoFAEnable === false && qr && (
        <div className="mt-4">
          <p className="mb-2">Scan this QR code with Google Authenticator:</p>
          <img src={qr} alt="2FA QR Code" className="my-2 w-48 h-48" />

          {secret && (
            <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono">
              {secret}{" "}
              <button
                onClick={() => navigator.clipboard.writeText(secret)}
                className="ml-2 text-blue-500 hover:underline"
              >
                Copy
              </button>
            </p>
          )}

          {!verified && (
            <FormProvider {...methods}>
              <div className="mt-4 flex flex-col items-center gap-2">
                <OtpInput name="otp" length={6} />
                <Button
                  onClick={onVerify}
                  className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                >
                  Verify
                </Button>
              </div>
            </FormProvider>
          )}

          {verified && (
            <p className="text-green-600 font-semibold mt-2">
              2FA is now enabled for your account!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;
