import React from "react";
import Input from "./Input";
import { Button } from "@/components/ui/button";

const ChangePassword = () => {
  return (
    <div className="border rounded-xl p-4 border-gray-200 dark:border-gray-700 pb-4">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <div className="space-y-4">
        <Input label="Current Password" type="password" />
        <Input label="New Password" type="password" />
        <Input label="Confirm New Password" type="password" />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
          Update Password
        </Button>
      </div>
    </div>
  );
};

export default ChangePassword;
