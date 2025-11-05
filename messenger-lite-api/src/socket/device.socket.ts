import { Socket } from "socket.io";
import { IOServerWithHelpers } from "./initSocket";

// Device structure
export interface Device {
  userId: string;
  deviceId: string; // unique per device
  deviceName: string;
  location?: string;
  sockets: Socket[]; // all tabs for this device
}

// Global array to track all devices
export const joinedDevices: Device[] = [];

// Emit updated devices for a user
const emitUserDevices = (
  io: IOServerWithHelpers,
  userId: string,
  currentSocketId?: string
) => {
  const userDevices = joinedDevices
    .filter((d) => d.userId === userId)
    .map((d) => ({
      id: d.deviceId,
      name: d.deviceName,
      location: d.location,
      active: d.sockets.some((s) => s.id === currentSocketId), // active only for current tab
    }));

  io.to(userId).emit("devicesUpdate", userDevices);
};

// Initialize device socket
export const initDeviceSocket = (io: IOServerWithHelpers, socket: Socket) => {
  const userId = socket.data.userId as string;
  const deviceId = socket.handshake.auth.deviceId as string;
  const deviceName = socket.handshake.auth.deviceName || "Unknown Device";
  const location = socket.handshake.auth.location || "Unknown";

  // Check if device already exists
  let device = joinedDevices.find(
    (d) => d.userId === userId && d.deviceId === deviceId
  );

  if (device) {
    // Add new tab to existing device
    device.sockets.push(socket);
  } else {
    // Create a new device entry
    device = { userId, deviceId, deviceName, location, sockets: [socket] };
    joinedDevices.push(device);
  }

  // Join a personal room for this user
  socket.join(userId);

  // Emit updated devices to all tabs of this user
  emitUserDevices(io, userId, socket.id);

  // Manual device request (e.g., tab switch)
  socket.on("request_devices", () => emitUserDevices(io, userId, socket.id));

  // Logout from a specific device (removes all its tabs)
  socket.on("logout_device", (targetDeviceId: string) => {
    const index = joinedDevices.findIndex(
      (d) => d.userId === userId && d.deviceId === targetDeviceId
    );
    if (index !== -1) {
      // Disconnect all tabs of this device
      joinedDevices[index]?.sockets.forEach((s) => s.disconnect(true));
      // Remove device
      joinedDevices.splice(index, 1);
      emitUserDevices(io, userId);
    }
  });

  // Cleanup when a tab disconnects
  socket.on("disconnect", () => {
    if (!device) return;

    // Remove this tab from the device
    device.sockets = device.sockets.filter((s) => s.id !== socket.id);

    // If no tabs remain, remove the device completely
    if (device.sockets.length === 0) {
      const idx = joinedDevices.findIndex(
        (d) => d.userId === userId && d.deviceId === deviceId
      );
      if (idx !== -1) joinedDevices.splice(idx, 1);
    }

    emitUserDevices(io, userId);
  });
};
