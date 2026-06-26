# Chat Functionality Overview

This document outlines the architecture and data flow for the messaging system within the application. The system employs a hybrid architecture: **REST API for sending messages** and **WebSockets (Socket.io) for receiving messages in real-time.**

## 1. Sending Messages (REST API)

All outgoing messages are handled by the `onSendMessage` function in `useChatStore.ts`. This function dispatches a `POST` request to the `/messages` REST endpoint using `FormData`.

### Text Messages
- **Payload:** The text content is appended to the `FormData` under the `message` key.
- **Process:** The backend receives the request, persists a single text message record in the database, and then broadcasts the message to the relevant conversation room via WebSockets.

### Media/File Messages
- **Payload:** Files are appended to the `FormData` under the `files` key. The system supports uploading multiple files simultaneously.
- **Process:** The backend handles file uploads (via Multer). For each file, the backend creates a distinct message record in the database, storing the file URL, original name, MIME type, and file size.

### Audio/Voice Messages
- **Payload:** Voice messages are captured locally and temporarily stored as a local URL (`voiceUrl`). The frontend fetches this URL, converts it into a `Blob`, and appends it to the `FormData` under the `files` key with the filename `voice-message.wav`.
- **Process:** Voice messages are treated identically to media file uploads. The backend saves the audio file, generates a URL, creates the message record, and broadcasts it to the recipients.

## 2. Receiving Messages (WebSockets)

To ensure immediate, real-time message delivery without the need for client-side polling, the system leverages WebSockets.

- **Backend Broadcast:** Once the REST API successfully saves the message(s) to the database, the backend (`SendMessageHandler.controller.ts`) iterates over the newly created messages and emits a `receive_message` socket event specifically to the conversation's room:
  ```typescript
  io.of("/chat").to(conversationRoom(msg.conversationId)).emit("receive_message", msg);
  ```
- **Frontend Listener:** The frontend maintains an active socket listener for the `receive_message` event within the `useChatStore.ts` Zustand store.
- **Real-time Update:** Upon receiving a new message event, the frontend verifies if the message belongs to the currently active chat window. If it does, the message is instantly appended to the `messages` array in the store. This triggers an immediate UI re-render, displaying the new message to the user instantly.

## 3. Optimistic UI Updates

To provide a seamless and responsive user experience, the frontend implements Optimistic UI updates utilizing a `clientTempId`:

1. **Generation:** When a user sends a message, a temporary unique ID (`clientTempId`) is generated locally and tracked in the state.
2. **Broadcast:** When the backend subsequently broadcasts the successfully saved message via the `receive_message` socket event, it includes this `clientTempId`.
3. **Reconciliation:** The frontend uses the `clientTempId` to correlate the incoming authoritative message with the temporary optimistic message rendered on the screen. It then silently replaces the temporary message with the finalized server message, ensuring no UI flickering occurs.

---
### Summary
The application effectively implements a **"Send via REST, Receive via Socket"** pattern for all message types (Text, Media, and Voice). This hybrid approach ensures reliable message persistence via standard HTTP requests while guaranteeing instantaneous real-time delivery and UI updates via WebSockets.
