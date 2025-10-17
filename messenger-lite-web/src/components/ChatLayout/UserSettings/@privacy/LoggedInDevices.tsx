"use client";

import React from "react";
import { useDevices, Device } from "@/hooks/useDevices";
import { Laptop, Smartphone, Globe, LogOut } from "lucide-react";

const deviceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("iphone") || n.includes("mobile") || n.includes("android"))
    return <Smartphone className="w-5 h-5 mr-2 text-gray-500" />;
  if (n.includes("mac") || n.includes("windows") || n.includes("linux"))
    return <Laptop className="w-5 h-5 mr-2 text-gray-500" />;
  return <Globe className="w-5 h-5 mr-2 text-gray-500" />;
};

const LoggedInDevices = () => {
  const { devices, logoutDevice } = useDevices();

  return (
    <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
        Logged-in Devices
      </h2>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {devices.map((device: Device) => (
          <div
            key={device.id}
            className={`flex items-center justify-between py-3 px-2 ${
              device.active
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-gray-50 dark:bg-gray-800/20"
            } rounded-md transition-colors`}
          >
            <div className="flex items-center">
              {deviceIcon(device.name)}
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {device.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {device.location || "Unknown location"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {device.active && (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                  Active
                </span>
              )}
              <button
                onClick={() => logoutDevice(device.id)}
                className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium hover:underline"
              >
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </button>
            </div>
          </div>
        ))}

        {devices.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No active devices
          </p>
        )}
      </div>
    </div>
  );
};

export default LoggedInDevices;
