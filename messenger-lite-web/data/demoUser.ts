import { User } from "../src/types/UserType";

export const demoUser: User = {
  email: "raihan_jami@example.com",
  id: "u123456",
  username: "raihan_jami",
  isOnline: true,
  avatar: "https://i.pravatar.cc/150?u=raihan_jami", // example avatar
  settings: {
    soundNotifications: true,
    theme: "dark",
  },
};
