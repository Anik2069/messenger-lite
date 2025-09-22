import { Group } from "../src/types/GroupType";

export const demoGroups: Group[] = [
  {
    _id: "g1",
    name: "Frontend Wizards",
    description:
      "Group for frontend enthusiasts discussing React, Tailwind, and more.",
    members: ["u1", "u2", "u3"],
    admin: ["u1"],
    avatar: "https://i.pravatar.cc/150?img=10",
    createdAt: new Date("2024-10-15T10:30:00"),
  },
  {
    _id: "g2",
    name: "Backend Builders",
    description:
      "A place to discuss APIs, databases, Node.js and server stuff.",
    members: ["u2", "u3", "u4", "u5"],
    admin: ["u3"],
    avatar: "https://i.pravatar.cc/150?img=11",
    createdAt: new Date("2025-01-02T08:45:00"),
  },
  {
    _id: "g3",
    name: "AI & ML Lab",
    description:
      "Exploring the world of machine learning, ChatGPT, and data science.",
    members: ["u1", "u4", "u5"],
    admin: ["u5"],
    avatar: "https://i.pravatar.cc/150?img=12",
    createdAt: new Date("2025-05-22T16:00:00"),
  },
  {
    _id: "g4",
    name: "DevOps Crew",
    description: "Sharing CI/CD, Docker, and cloud deployment practices.",
    members: ["u2", "u5"],
    admin: ["u2"],
    avatar: "https://i.pravatar.cc/150?img=13",
    createdAt: new Date("2025-07-10T12:00:00"),
  },
];
