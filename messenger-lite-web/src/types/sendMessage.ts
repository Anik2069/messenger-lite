export type UIMessageKind = "text" | "file" | "forwarded";
export type ServerMessageType = "TEXT" | "FILE" | "FORWARDED";

export interface SendMessagePayload {
  // DM হলে recipientId, group/known conv হলে conversationId
  conversationId?: string;
  recipientId?: string;

  message: string;
  messageType: ServerMessageType;

  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;

  forwardedFrom?: string;
  clientTempId?: string;
}

// helper: UI → server enum
export const toServerType = (t: UIMessageKind): ServerMessageType =>
  t === "file" ? "FILE" : t === "forwarded" ? "FORWARDED" : "TEXT";
