import { User } from "../src/types/UserType";

// Demo users
export const users: User[] = [
  {
    id: "u1",
    username: "raihan_jami",
    isOnline: true,
    avatar: "https://i.pravatar.cc/150?img=1",
    settings: {
      soundNotifications: true,
      theme: "dark",
    },
    email: "raihan_jami@example.com",
  },
  {
    id: "u2",
    username: "sadia_akter",
    isOnline: false,
    avatar: "https://i.pravatar.cc/150?img=2",
    settings: {
      soundNotifications: false,
      theme: "light",
    },
    email: "sadia_akter@example.com",
  },
  {
    id: "u3",
    username: "nahid_hasnat",
    isOnline: true,
    avatar: "https://i.pravatar.cc/150?img=3",
    settings: {
      soundNotifications: true,
      theme: "light",
    },
    email: "nahid_hasnat@example.com",
  },
  {
    id: "u4",
    username: "maisha_rahman",
    isOnline: false,
    avatar: "https://i.pravatar.cc/150?img=4",
    settings: {
      soundNotifications: false,
      theme: "dark",
    },
    email: "maisha_rahman@example.com",
  },
  {
    id: "u5",
    username: "fahim_khan",
    isOnline: true,
    avatar: "https://i.pravatar.cc/150?img=5",
    settings: {
      soundNotifications: true,
      theme: "dark",
    },
    email: "fahim_khan@example.com",
  },
];
