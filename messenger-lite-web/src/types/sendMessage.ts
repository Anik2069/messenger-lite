export type UIMessageKind = "text" | "FILE" | "forwarded";
export type ServerMessageType = "text" | "FILE" | "forwarded";

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
  t === "FILE" ? "FILE" : t === "forwarded" ? "forwarded" : "text";
