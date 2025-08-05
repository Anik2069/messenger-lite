export interface Message {
  id: string;
  from: string;
  to: string;
  message: string;
  messageType: "text" | "file" | "forwarded";
  fileData?: FileData;
  forwardedFrom?: ForwardedData;
  isGroupMessage: boolean;
  timestamp: Date;
  reactions: Reaction[];
  readBy: ReadReceipt[];
}

export interface FileData {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface ForwardedData {
  originalSender: string;
  originalTimestamp: Date;
}

export interface Reaction {
  emoji: string;
  username: string;
  timestamp: Date;
}

export interface ReadReceipt {
  username: string;
  timestamp: Date;
}
