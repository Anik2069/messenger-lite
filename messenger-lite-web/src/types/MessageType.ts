import { format, isValid } from "date-fns";
import { User } from "./UserType";

export type MessageKind = "TEXT" | "FILE" | "forwarded" | "VOICE";

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

export function formatLocalDateTime(timestamp?: string | Date | null): string {
  if (!timestamp) return "-";

  const date = new Date(timestamp);

  if (!isValid(date)) return "-";

  return format(date, "MMM d, yyyy, hh:mm a");
}

export function formatLocalTime(timestamp?: string | Date | null): string {
  if (!timestamp) return "-"; // or "N/A"

  const date = new Date(timestamp);

  if (!isValid(date)) return "-"; // avoid crashing

  return format(date, "hh:mm a");
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
  fileData?: object;
  // Add backend raw fields (optional)
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;

  forwardedFrom?: ForwardedData;
  isGroupMessage: boolean;
  timestamp: Date;
  reactions: Reaction[];
  readBy: ReadReceipt[];
  author?: User;
  createdAt?: string | number | Date;
}
