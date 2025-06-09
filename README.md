# ✨ Full Stack Realtime Chat App ✨

![Demo App](/frontend/public/screenshot-for-readme.png)

# Building a Realtime Chat App with React, Node.js, and Socket.IO

**Try it out:** [Vercel](https://pingme-chat-application.onrender.com/)

**Blog:** [Medium](https://medium.com/@meenakshiratnawat0/everything-you-need-to-know-about-socket-io-with-a-practical-chat-app-example-f779364827cc) 

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
- **Error handling:** Implemented on both server and client sides to handle API errors, socket disconnects, and edge cases gracefully  

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

## Why Socket.IO

- Provides **bidirectional realtime communication**  
- Works reliably across browsers and network conditions  
- Handle reconnections automatically  
-  Support an **event-driven API** for chat events like `newMessage`, `typing`, `messages-read`, `contact-accept`  
- Works on top of WebSockets with minimal setup.

---

**GitHub Repo:** [Link](https://github.com/Meenakshiratnawat/pingme-chat-application)

---

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

---

Contact Me: [LinkedIn](https://www.linkedin.com/in/meenakshi-ratnawat-aa71771b2/)
