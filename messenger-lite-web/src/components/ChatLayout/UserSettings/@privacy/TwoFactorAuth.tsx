import { Button } from "@/components/ui/button";
import React from "react";

const TwoFactorAuth = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">2FA Authentication</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Secure your account by enabling two-factor authentication using Google
        Authenticator or similar apps.
      </p>
      <Button className="bg-green-600 hover:bg-green-700 text-white">
        Setup 2FA
      </Button>
    </div>
  );
};

export default TwoFactorAuth;
