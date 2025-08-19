import { Server as SocketIOServer } from "socket.io";

// Store connected users with their socket IDs
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

  io.on("connect", (socket) => {
    console.log("User connected:", socket.id);

    // Listen for user authentication
    socket.on("user_connected", (userId: string) => {
      // Remove user if already exists (in case of reconnection)
      connectedUsers = connectedUsers.filter((user) => user.userId !== userId);

      // Add user to connected list
      connectedUsers.push({ userId, socketId: socket.id });

      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
      console.log("Connected users:", connectedUsers);
    });

    socket.on("send_message", (message) => {
      console.log("Received message:", message);

      // Find recipient's socket ID
      const recipient = connectedUsers.find(
        (user) => user.userId === message.to
      );

      if (recipient) {
        io.to(recipient.socketId).emit("receive_message", message);
        console.log(`Message sent to user ${message.to}`);
      } else {
        console.log(`Recipient ${message.to} not found`);
      }
    });

    socket.on("message_reaction", (payload) => {
      io.emit("message_reaction", payload);
    });

    socket.on("typing", (data) => {
      const { chatId, username } = data;
      socket.broadcast.emit("user_typing", { chatId, username });
      console.log(`${username} is typing in chat ${chatId}`);
    });

    socket.on("disconnect", () => {
      // Remove user from connected list
      connectedUsers = connectedUsers.filter(
        (user) => user.socketId !== socket.id
      );
      console.log("User disconnected:", socket.id);
      console.log("Remaining connected users:", connectedUsers);
    });
  });

  return io;
};
