export type MessageKind = "text" | "file" | "forwarded";

export interface MiniUserRef {
  id: string;
  username: string;
}

export interface FileData {
  url: string;
  filename: string;
  originalName?: string;
  size: number;
  mimetype: string;
}

export interface ForwardedData {
  originalSender: string;
  originalTimestamp?: Date;
}

export interface Reaction {
  emoji: string;
  userId?: string;
  username: string;
  timestamp: Date;
}

export interface ReadReceipt {
  userId?: string;
  username?: string | null;
  timestamp: Date;
}

export interface Message {
  id: string;
  clientTempId?: string;
  conversationId: string;
  from: MiniUserRef;
  to: MiniUserRef;
  message: string;
  messageType: MessageKind;
  fileData?: FileData;
  forwardedFrom?: ForwardedData;
  isGroupMessage: boolean;
  timestamp: Date;
  reactions: Reaction[];
  readBy: ReadReceipt[];
}
