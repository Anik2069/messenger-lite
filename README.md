# Messenger Lite - System Concept & Architecture

Welcome to **Messenger Lite**, a real-time chat application split into two main components: a modern Web frontend and a robust backend API. This document explains the core concepts, technologies, and architecture of both the Web and API parts to help new developers understand the system.

## 🏗 High-Level Architecture

Messenger Lite uses a client-server architecture:
- **Frontend (Web):** A responsive, fast, and interactive user interface built with Next.js and React.
- **Backend (API):** A Node.js REST API with WebSocket support for real-time messaging, managing data persistence and business logic.

The two communicate via standard HTTP requests for typical operations (e.g., authentication, fetching history) and WebSockets for real-time interactions (e.g., sending/receiving messages instantly, typing indicators, audio/video calls).

---

## 🌐 1. Web Application (`messenger-lite-web`)

The Web application is the user-facing part of Messenger Lite. It provides a seamless and interactive experience similar to modern messaging platforms.

### Core Technologies
- **Framework:** [Next.js (App Router)](https://nextjs.org/) & **React 19**
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/) primitives for accessible components.
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) for lightweight, global client state.
- **Form Handling & Validation:** `react-hook-form` paired with `zod`.
- **Real-time Communication:** `socket.io-client` for connecting to the API's WebSocket server.
- **Animations:** `framer-motion` for smooth UI transitions.
- **Media:** `wavesurfer.js` for rendering audio waveforms (useful for voice messages).

### Key Concepts
- **Real-time Updates:** Using `socket.io-client`, the web app listens for incoming messages, online status changes, and typing indicators to update the UI instantly without polling.
- **Responsive Design:** Built with Tailwind, the UI is optimized for both desktop and mobile views.
- **Authentication:** Uses JWT tokens stored securely to maintain user sessions and authorize API requests.

---

## ⚙️ 2. Backend API (`messenger-lite-api`)

The API acts as the central hub, processing all business logic, storing data, and routing real-time events between users.

### Core Technologies
- **Framework:** [Express.js](https://expressjs.com/) (Node.js)
- **Database ORM:** [Prisma](https://www.prisma.io/) (used to interact with a relational database, e.g., PostgreSQL/MySQL) along with Mongoose.
- **Real-time Engine:** [Socket.io](https://socket.io/) for bidirectional real-time event handling.
- **Authentication & Security:** 
  - `jsonwebtoken` (JWT) for secure, stateless authentication.
  - `bcrypt` for password hashing.
  - `speakeasy` & `qrcode` for Two-Factor Authentication (2FA).
- **File Handling:** `multer` for processing file/media uploads (e.g., profile pictures, attachments).

### Key Concepts
- **RESTful Endpoints:** Standard HTTP endpoints handle actions like User Registration, Login, fetching chat history, and updating profiles.
- **WebSocket Gateway:** Socket.io handles active connections. When a user sends a message, it is saved to the database, and then broadcasted to the intended recipient's active socket connection.
- **Data Persistence:** Prisma manages complex relational data (Users, Conversations, Messages) with strict type safety.
- **Security:** Rate limiting (`express-rate-limit`) prevents brute force attacks, while CORS rules ensure only authorized clients can access the API.

---

## 🔄 How They Work Together

1. **Authentication Flow:** 
   - The user enters credentials on the **Web**.
   - The Web sends a POST request to the **API**.
   - The API verifies credentials, generates a JWT, and returns it.
   - The Web stores this JWT and uses it for all subsequent requests.

2. **Real-time Messaging Flow:**
   - After logging in, the **Web** establishes a WebSocket connection to the **API** using `socket.io-client`, passing the JWT for authentication.
   - User A types a message and hits send. The **Web** emits a `sendMessage` event (or makes a POST request).
   - The **API** receives the message, saves it to the database, and identifies the recipient (User B).
   - The **API** uses Socket.io to emit a `receiveMessage` event directly to User B's active connection.
   - User B's **Web** client receives the event and instantly updates the chat UI.

3. **File Uploads (Images, Voice Notes):**
   - User uploads an image or voice note. The **Web** sends a `multipart/form-data` request.
   - The **API** uses `multer` to save the file locally in the `/uploads` directory (or cloud storage) and returns the file URL to be displayed or played (via `wavesurfer.js`) in the chat.
