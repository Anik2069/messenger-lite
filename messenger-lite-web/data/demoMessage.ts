import { Message } from "../types/MessageType";
import { demoUser } from "./demoUser";

export const demoMessages: Record<string, Message[]> = {
  // Private chat with raihan_jami (u1)
  u1: [
    {
      id: "m1",
      from: "raihan_jami",
      to: demoUser.username,
      message: "Hey! Have you checked out the new React docs?",
      messageType: "text",
      isGroupMessage: false,
      timestamp: new Date(Date.now() - 3600000),
      reactions: [
        {
          emoji: "👍",
          username: demoUser.username,
          timestamp: new Date(Date.now() - 3500000),
        },
      ],
      readBy: [
        {
          username: demoUser.username,
          timestamp: new Date(Date.now() - 3590000),
        },
      ],
    },
    {
      id: "m2",
      from: demoUser.username,
      to: "raihan_jami",
      message: "Not yet! Are there any major changes?",
      messageType: "text",
      isGroupMessage: false,
      timestamp: new Date(Date.now() - 3000000),
      reactions: [],
      readBy: [],
    },
    {
      id: "m3",
      from: "raihan_jami",
      to: demoUser.username,
      message: "Yes! They've added new hooks. Here's the changelog:",
      messageType: "file",
      fileData: {
        filename: "react_changelog.pdf",
        originalName: "React_19_Changelog.pdf",
        size: 2500000,
        mimetype: "application/pdf",
        url: "/react-changelog.pdf",
      },
      isGroupMessage: false,
      timestamp: new Date(Date.now() - 2400000),
      reactions: [],
      readBy: [],
    },
  ],

  // Private chat with sadia_akter (u2)
  u2: [
    {
      id: "m4",
      from: "sadia_akter",
      to: demoUser.username,
      message: "Can you review my UI designs before the meeting?",
      messageType: "text",
      isGroupMessage: false,
      timestamp: new Date(Date.now() - 86400000),
      reactions: [],
      readBy: [
        {
          username: demoUser.username,
          timestamp: new Date(Date.now() - 86300000),
        },
      ],
    },
    {
      id: "m5",
      from: demoUser.username,
      to: "sadia_akter",
      message: "Sure! Can you share the Figma link?",
      messageType: "text",
      isGroupMessage: false,
      timestamp: new Date(Date.now() - 82800000),
      reactions: [
        {
          emoji: "❤️",
          username: "sadia_akter",
          timestamp: new Date(Date.now() - 82700000),
        },
      ],
      readBy: [],
    },
    {
      id: "m6",
      from: "sadia_akter",
      to: demoUser.username,
      message: "Here you go: figma.com/design/12345",
      messageType: "text",
      isGroupMessage: false,
      timestamp: new Date(Date.now() - 81000000),
      reactions: [],
      readBy: [],
    },
  ],

  // Frontend Wizards group (g1)
  g1: [
    {
      id: "m7",
      from: "raihan_jami",
      to: "g1",
      message:
        "Welcome everyone to our frontend community! Let's discuss the upcoming React conference.",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2024-10-15T11:00:00"),
      reactions: [
        {
          emoji: "👍",
          username: demoUser.username,
          timestamp: new Date("2024-10-15T11:05:00"),
        },
        {
          emoji: "❤️",
          username: "nahid_hasnat",
          timestamp: new Date("2024-10-15T11:10:00"),
        },
      ],
      readBy: [
        {
          username: demoUser.username,
          timestamp: new Date("2024-10-15T11:01:00"),
        },
        {
          username: "nahid_hasnat",
          timestamp: new Date("2024-10-15T11:02:00"),
        },
      ],
    },
    {
      id: "m8",
      from: demoUser.username,
      to: "g1",
      message:
        "I'm excited about the new React compiler they'll be presenting!",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2024-10-16T09:30:00"),
      reactions: [],
      readBy: [],
    },
    {
      id: "m9",
      from: "nahid_hasnat",
      to: "g1",
      message:
        "Check out this Tailwind CSS tutorial from the conference last year",
      messageType: "forwarded",
      forwardedFrom: {
        originalSender: "maisha_rahman",
        originalTimestamp: new Date("2023-10-15T14:00:00"),
      },
      isGroupMessage: true,
      timestamp: new Date("2024-10-16T10:15:00"),
      reactions: [],
      readBy: [],
    },
    {
      id: "m10",
      from: "sadia_akter",
      to: "g1",
      message: "I've uploaded our design system components",
      messageType: "file",
      fileData: {
        filename: "design_system_2024.zip",
        originalName: "Frontend_Design_System.zip",
        size: 10485760,
        mimetype: "application/zip",
        url: "/design-system.zip",
      },
      isGroupMessage: true,
      timestamp: new Date("2024-10-17T15:30:00"),
      reactions: [
        {
          emoji: "👍",
          username: demoUser.username,
          timestamp: new Date("2024-10-17T15:35:00"),
        },
        {
          emoji: "👍",
          username: "raihan_jami",
          timestamp: new Date("2024-10-17T15:40:00"),
        },
      ],
      readBy: [],
    },
  ],

  // Backend Builders group (g2)
  g2: [
    {
      id: "m11",
      from: "nahid_hasnat",
      to: "g2",
      message: "Our new API documentation is now live at api.docs.example.com",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2025-01-03T09:00:00"),
      reactions: [],
      readBy: [],
    },
    {
      id: "m12",
      from: "fahim_khan",
      to: "g2",
      message: "Has anyone tried Prisma 5.0 with the new MongoDB connector?",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2025-01-03T13:45:00"),
      reactions: [
        {
          emoji: "😮",
          username: "sadia_akter",
          timestamp: new Date("2025-01-03T13:50:00"),
        },
      ],
      readBy: [],
    },
    {
      id: "m13",
      from: demoUser.username,
      to: "g2",
      message: "I'm testing it now. Initial benchmarks look promising!",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2025-01-03T15:30:00"),
      reactions: [],
      readBy: [],
    },
  ],

  // AI & ML Lab group (g3)
  g3: [
    {
      id: "m14",
      from: "fahim_khan",
      to: "g3",
      message: "Just trained a new NLP model with 95% accuracy!",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2025-05-23T10:00:00"),
      reactions: [
        {
          emoji: "👍",
          username: "raihan_jami",
          timestamp: new Date("2025-05-23T10:05:00"),
        },
        {
          emoji: "😮",
          username: "maisha_rahman",
          timestamp: new Date("2025-05-23T10:10:00"),
        },
      ],
      readBy: [],
    },
    {
      id: "m15",
      from: "maisha_rahman",
      to: "g3",
      message: "Here's the research paper I mentioned about GPT-5 architecture",
      messageType: "file",
      fileData: {
        filename: "gpt5_research.pdf",
        originalName: "GPT5_Architecture.pdf",
        size: 3500000,
        mimetype: "application/pdf",
        url: "/gpt5-research.pdf",
      },
      isGroupMessage: true,
      timestamp: new Date("2025-05-24T14:30:00"),
      reactions: [],
      readBy: [],
    },
  ],

  // DevOps Crew group (g4)
  g4: [
    {
      id: "m16",
      from: "sadia_akter",
      to: "g4",
      message: "Our CI/CD pipeline is now fully automated with GitHub Actions!",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2025-07-11T09:00:00"),
      reactions: [
        {
          emoji: "👍",
          username: "fahim_khan",
          timestamp: new Date("2025-07-11T09:05:00"),
        },
      ],
      readBy: [],
    },
    {
      id: "m17",
      from: "fahim_khan",
      to: "g4",
      message: "I've created a Docker image for our microservices",
      messageType: "text",
      isGroupMessage: true,
      timestamp: new Date("2025-07-12T11:30:00"),
      reactions: [],
      readBy: [],
    },
  ],
};
