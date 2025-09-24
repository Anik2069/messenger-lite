import { Message } from "./MessageType";
import { User } from "./UserType";

export type Conversation = {
  id: string;
  type: "DIRECT" | "GROUP" | string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  participants: {
    user: User;
  }[];
  messages: Message[];
};
