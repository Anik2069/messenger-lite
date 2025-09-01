import { Message } from "./MessageType";

export interface ReactionWire {
  emoji: string;
  username: string;
  timestamp: string | Date;
}

export interface ReadReceiptWire {
  username?: string | null;
  timestamp: string | Date;
}

export interface MessageWire
  extends Omit<Message, "timestamp" | "reactions" | "readBy"> {
  timestamp: string | Date;
  reactions?: ReactionWire[];
  readBy?: ReadReceiptWire[];
}

export type MessageWireServer = MessageWire & {
  conversationId?: string;
  conversationType?: "DIRECT" | "GROUP";
};
