# ✨ Full Stack Realtime Chat App ✨

![Demo App](/frontend/public/screenshot-for-readme.png)


# Building a Realtime Chat App with React, Node.js, and Socket.IO

**GitHub Repo:** [Your Chat App Repo Link Here](https://github.com/your-repo-link)

---

## Highlights

🌟 **Tech stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Socket.IO + TailwindCSS + DaisyUI  
🎃 **Authentication & Authorization:** Secure login with JWT-based authentication and protected routes  
👾 **Realtime messaging:** Instant chat powered by Socket.IO with persistent WebSocket connections  

**Core Realtime Features:**  
- **Online user status:** Display live "online" indicators for active users  
- **Who is typing:** Show typing indicators when the other user is typing  
- **Message delivery in realtime:** New messages instantly delivered across all active clients  
- **Contact requests:** Realtime contact request system — send, receive, and accept contact requests with instant feedback  
- **Contact request notifications:** When a contact request is sent, the target user receives an instant in-app notification via Socket.IO  
- **Realtime contact acceptance:** When a contact request is accepted, both users immediately see each other added to their contacts — no refresh required  
- **Read receipts:** Visual feedback showing if the recipient has read the message  
🐞 **Robust error handling:** Implemented on both server and client sides to handle API errors, socket disconnects, and edge cases gracefully  

---

---

## Introduction

Building a realtime chat app has been one of the most exciting projects in our stack. 

Users today expect chat to be **instant**, **responsive**, and **feature-rich** — and achieving this means going beyond traditional HTTP APIs.

In this article, I’ll share how we built our realtime chat app using **React**, **Node.js**, and **Socket.IO** — with realtime presence, messaging, typing indicators, and read receipts — all backed by a **MERN stack**.

---

## Architecture Overview

```
Frontend → Socket.IO Client
Backend  → Socket.IO Server
MongoDB  → For persisting messages, contacts, and user data
```

**Flow:**  
- The client establishes a **Socket.IO connection** to the server after authentication  
- The server maintains a **userSocketMap** to track who is online  
- Events flow both ways to power realtime updates  

---

## Why We Chose Socket.IO

We needed a solution that would:  

 Provide **bidirectional realtime communication**  
 Work reliably across browsers and network conditions  
 Handle reconnections automatically  
 Support an **event-driven API** → perfect for chat events like `newMessage`, `typing`, `messages-read`,`contact-accept`  

Socket.IO gave us all of this — on top of WebSockets — with minimal setup.

---

## Key Features — How We Implemented Them

### Online Users

We track online users using this pattern:

**Backend:**

```js
const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
```

**Frontend:**

```js
connectSocket: () => {
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

  const socket = io(BASE_URL, {
    query: { userId: authUser._id },
  });

  socket.connect();

  set({ socket: socket });

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });
},
```

**Result:** User sees "Online" badges update in realtime.

---

### Messaging in Realtime

When a message is sent:

- **Client emits** `newMessage` to server
- **Server stores** the message in DB → emits `newMessage` to recipient
- **Recipient's client** displays it instantly

**Frontend:**

```js
socket.emit("newMessage", messagePayload);

socket.on("newMessage", (message) => {
  setMessages((prev) => [...prev, message]);
});
```

---

### Typing Indicators

**Frontend:**

```js
// When typing starts
socket.emit("typing", { senderId, receiverId });

// When typing stops
socket.emit("stopTyping", { senderId, receiverId });

// Listen for typing events
socket.on("typing", ({ senderId }) => {
  setIsTyping(true);
});

socket.on("stopTyping", ({ senderId }) => {
  setIsTyping(false);
});
```

**Backend:**

```js
socket.on("typing", ({ senderId, receiverId }) => {
  const receiverSocketId = userSocketMap[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("typing", { senderId });
  }
});

socket.on("stopTyping", ({ senderId, receiverId }) => {
  const receiverSocketId = userSocketMap[receiverId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("stopTyping", { senderId });
  }
});
```

**Result:** Typing indicator shows in the chat header.

---

### Read Receipts

**Frontend:**

```js
// When user opens chat
socket.emit("chat-opened", { readerId: authUser._id, senderId: selectedUser._id });

socket.on("messages-read", ({ senderId, readerId }) => {
  updateReadStatusInMessages(senderId, readerId);
});
```

**Backend:**

```js
socket.on("chat-opened", async ({ readerId, senderId }) => {
  await Message.updateMany(
    { senderId, receiverId: readerId, status: { $ne: "read" } },
    { $set: { status: "read" } }
  );

  const senderSocketId = userSocketMap[senderId];
  if (senderSocketId) {
    io.to(senderSocketId).emit("messages-read", { senderId, readerId });
  }
});
```

**Result:** Sender sees "read" tick once recipient opens chat.

---

### Contact Requests

**Frontend:**

```js
socket.emit("contact-request", { senderId, receiverId, senderName });

socket.on("contact-request-received", (data) => {
  showToast(`${data.senderName} wants to add you as a contact.`);
});
```

**Backend:**

```js
socket.on("contact-request", ({ senderId, receiverId, senderName }) => {
  io.to(receiverId).emit("contact-request-received", {
    senderId,
    senderName,
    message: `${senderName} wants to add you as a contact.`,
  });
});
```

**Result:** Realtime contact request pop-up!

---

## Error Handling

We implemented error handling at two levels:

**API errors** → caught in Axios interceptors, displayed via toast  
**Socket errors and disconnects:**

```js
socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err);
});

socket.on("disconnect", (reason) => {
  console.warn("Socket disconnected:", reason);
});
```

**Result:** App handles socket drops gracefully.

---

## Lessons Learned

- Socket.IO is **perfect for chat** — the event-based API fits naturally.  
- Managing **userSocketMap** is critical for presence tracking.  
- Always handle **disconnects and reconnects**.  
- Typing indicators need to be throttled → otherwise too many events.  
- Read receipts can be tricky — do it **on chat open**, not per message scroll.

---

## Final Thoughts

Building our chat app with Socket.IO was a fantastic learning journey.
It enabled us to deliver a polished realtime experience with:
	•	Instant messaging
	•	Online presence
	•	Typing indicators
	•	Read receipts
	•	Contact requests and notifications

...all powered by **a simple, clean Socket.IO architecture**.

If you’re building a chat or realtime app → I can’t recommend Socket.IO enough.

---
**GitHub Repo:** [ Chat App Repo Link Here](https://github.com/Meenakshiratnawat/fullstack-chat-app-master/tree/main)

---

If you found this useful — feel free to share how *you* are using Socket.IO in your apps!



### Setup .env file

```js
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=development
```

### Build the app

```shell
npm run build
```

### Start the app

```shell
npm start
```
