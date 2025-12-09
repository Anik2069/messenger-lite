'use client';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export interface Device {
  id: string;
  name: string;
  location: string;
  active: boolean;
}

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleUpdate = (updatedDevices: Device[]) => {
      setDevices(updatedDevices);
    };

    socket.on('devicesUpdate', handleUpdate);
    socket.emit('request_devices');

    return () => {
      socket.off('devicesUpdate', handleUpdate);
    };
  }, []);

  const logoutDevice = (deviceId: string) => {
    socket.emit('logout_device', deviceId);
  };

  return { devices, logoutDevice };
};
