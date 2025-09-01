import { Server as SocketIOServer } from "socket.io";

interface ConnectedUser {
  userId: string;
  socketId: string;
}

let connectedUsers: ConnectedUser[] = [];

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
    console.log("User connected:", socket.id);

    // Listen for user authentication
    socket.on("user_connected", (userId: string) => {
      //track
      connectedUsers = connectedUsers.filter((user) => user.userId !== userId);
      connectedUsers.push({ userId, socketId: socket.id });

      socket.join(userId);

      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
      console.log("Connected users:", connectedUsers);
    });

    // OPTIONAL: if  allow direct socket sending

    //  socket.on("send_message", (message) => {
    //   const toId = message?.to?.id;
    //   const fromId = message?.from?.id;
    //   if (toId) io.to(toId).emit("receive_message", message);
    //   if (fromId) io.to(fromId).emit("receive_message", message); // echo
    // });

    socket.on("message_reaction", (payload) => {
      io.emit("message_reaction", payload);
    });

    socket.on("typing", ({ chatId, username, audienceUserId }) => {
      if (audienceUserId)
        socket.to(audienceUserId).emit("user_typing", { chatId, username });
      console.log(`${username} is typing in chat ${chatId}`);
    });

    socket.on("disconnect", () => {
      connectedUsers = connectedUsers.filter(
        (user) => user.socketId !== socket.id
      );
      console.log("User disconnected:", socket.id);
      console.log("Remaining connected users:", connectedUsers);
    });
  });

  return io;
};
