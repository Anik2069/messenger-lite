import { SOCKET_HOST } from "@/constant";
import { io } from "socket.io-client";

export const socket = io(SOCKET_HOST, {
  withCredentials: true,
  autoConnect: true,
  auth: { token: localStorage.getItem("accessToken") },
});
