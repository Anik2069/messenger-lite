// socket.ts
import { SOCKET_HOST } from "@/constant";
import { io } from "socket.io-client";
import { uuidv4 } from "./utils";

let token: string | null = null;
if (typeof window !== "undefined") {
  token = localStorage.getItem("accessToken");
}

// Unique deviceId per browser/device
let deviceId: string | null = null;
if (typeof window !== "undefined") {
  deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("deviceId", deviceId);
  }
}

export const socket = io(SOCKET_HOST, {
  withCredentials: true,
  autoConnect: true,
  auth: {
    token: token || "",
    deviceId,
    deviceName: navigator.userAgent,
    location: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});
