"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { Input2 } from "./Input2";
import { useAuth } from "@/context/useAuth";

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    // .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    // .regex(/[a-z]/, "Must contain at least one lowercase letter"),
    // .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordFormData) => {
    try {
      console.log("Password Update:", data);
      const { confirmPassword, currentPassword } = data;
      const response = await changePassword(currentPassword, confirmPassword);
      if (response?.statusCode === 200) {
        reset();
      }
    } catch {
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="border rounded-xl p-4 border-gray-200 dark:border-gray-700 pb-4">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current Password
          </label>
          <Input2
            type="password"
            aria-invalid={!!errors.currentPassword}
            {...register("currentPassword")}
          />
          {errors.currentPassword && (
            <p className="text-sm text-red-500">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <Input2
            type="password"
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm New Password
          </label>
          <Input2
            type="password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          // disabled={isSubmitting}
          className={cn(
            "bg-blue-600 hover:bg-blue-700 text-white w-full mt-2"
            // isSubmitting && "opacity-80 cursor-not-allowed"
          )}
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;
