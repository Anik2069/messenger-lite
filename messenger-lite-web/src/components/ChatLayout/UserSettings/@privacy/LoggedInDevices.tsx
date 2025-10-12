import { Button } from "@/components/ui/button";
import React from "react";

const LoggedInDevices = () => {
  const devices = [
    {
      name: "Windows 11 - Chrome",
      location: "Dhaka, Bangladesh",
      active: true,
    },
    {
      name: "Android - Messenger Lite",
      location: "Dhaka, Bangladesh",
      active: false,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Logged-in Devices</h2>
      <div className="space-y-3">
        {devices.map((device, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center border p-3 rounded-lg bg-white/60 dark:bg-gray-800/60"
          >
            <div>
              <p className="font-medium">{device.name}</p>
              <p className="text-sm text-gray-500">{device.location}</p>
            </div>
            {device.active ? (
              <span className="text-green-600 text-sm font-semibold">
                Active
              </span>
            ) : (
              <Button variant="outline" size="sm">
                Logout
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoggedInDevices;
