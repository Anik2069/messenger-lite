'use client';

import React, { useEffect } from 'react';
// import { useDevices, Device } from "@/hooks/useDevices";
// import { Laptop, Smartphone, Globe, LogOut } from "lucide-react";
import { DeviceCardSkeleton } from './DeviceCardSkeleton';
import { DeviceCard } from './DeviceCard';
import { useAuth } from '@/context/useAuth';

const LoggedInDevices = () => {
  // const { devices, logoutDevice } = useDevices();
  const { user, userTrustedDevices, isLoadingUserTrustedDevices, fetchTrustedDevices } = useAuth();

  useEffect(() => {
    if (user) fetchTrustedDevices(user.id);
  }, [user, fetchTrustedDevices]);
  return (
    <div className="w-full">
      {isLoadingUserTrustedDevices ? (
        // Show 3 skeleton cards while loading
        <div className="space-y-4 px-2">
          {[...Array(2)].map((_, i) => (
            <DeviceCardSkeleton key={i} />
          ))}
        </div>
      ) : userTrustedDevices && userTrustedDevices?.length > 0 ? (
        // Show list of trusted devices
        <div className="space-y-4 px-2">
          <div className="grid grid-cols-1 gap-4">
            {userTrustedDevices.map((device) => (
              <DeviceCard
                key={device.id}
                {...device}
                last_active={device.last_active.toString()}
                isCurrent={false}
                // onTerminate={handleDeleteSession} // Uncomment when ready
              />
            ))}
          </div>
        </div>
      ) : (
        // Empty state
        <p className="text-gray-400 text-sm px-4 py-2 text-center">No trusted devices yet.</p>
      )}
    </div>
  );
};

export default LoggedInDevices;
