import { SOCKET_HOST } from "@/constant";
import { io } from "socket.io-client";

let token: string | null = null;
if (typeof window !== "undefined") {
  token = localStorage.getItem("accessToken");
}

export const socket = io(SOCKET_HOST, {
  withCredentials: true,
  autoConnect: true,
  auth: { token: token || "" },
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});
