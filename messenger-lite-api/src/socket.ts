import { Server as SocketIOServer } from "socket.io";

export const initSocket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://172.21.16.3:3000",
        "http://10.81.100.22:3001",
        "http://10.81.100.22:3002",
        "http://192.168.31.152:3000",
        "http://192.168.31.152:3000",
      ],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    console.log(" User connected:", socket.id);
    socket.on("send_message", (message) => {
      io.emit("receive_message", message);
    });

    socket.on("message_reaction", (payload) => {
      io.emit("message_reaction", payload);
    });

    socket.on("typing", (username) => {
      socket.broadcast.emit("user_typing", username);
    });

    socket.on("disconnect", () => {
      console.log(" User disconnected:", socket.id);
    });
  });

  return io;
};
