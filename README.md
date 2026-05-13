# Connectify - Social Media Platform

![Connectify](https://img.shields.io/badge/Status-Active-brightgreen) ![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue) ![Realtime](https://img.shields.io/badge/Realtime-Socket.io-black)

## 📖 Overview
Connectify is a modern, real-time social media platform designed to seamlessly connect people. Built with the MERN stack (MongoDB, Express, React, Node.js) and enhanced with Socket.io for real-time communication, it offers a dynamic user experience featuring private messaging, post sharing, user connections, and live notifications.

## ✨ Key Features
- **User Authentication**: Secure signup and login mechanisms utilizing JWT (JSON Web Tokens) and bcrypt for password hashing.
- **Real-Time Chat Engine**: Direct messaging built on WebSockets.
  - **Live Typing Indicators**: See when someone is replying in real-time.
  - **Read Receipts**: Instant "seen" status updates.
  - **Message Management**: Real-time message deletion synchronized across both clients.
- **Social Feed & Posts**: Create, view, and interact with posts on a global or tailored feed.
- **Media Uploads**: Seamless Cloudinary integration using Multer for handling profile pictures and rich media posts.
- **Following System**: Follow and unfollow other users to curate a personalized network.
- **Responsive UI**: A beautiful, modern interface built using React, Tailwind CSS, and Lucide React icons.

## 🛠️ Tech Stack

### Frontend
- **React.js (v18)** - Core UI framework
- **Tailwind CSS & Bootstrap** - Styling and responsive design
- **Socket.io-client** - Real-time bidirectional communication
- **Axios** - HTTP client for RESTful API requests
- **Lucide React & React Icons** - UI Iconography

### Backend
- **Node.js & Express.js** - Server runtime and API framework
- **MongoDB & Mongoose** - NoSQL database and Object Data Modeling (ODM)
- **Socket.io** - Real-time event-based communication server
- **Cloudinary & Multer** - Media storage and upload middleware
- **JWT & bcryptjs** - Authentication and security

## 🔌 Technical Highlight: Socket Programming
Connectify heavily relies on WebSockets (`Socket.io`) to bypass the limitations of traditional HTTP polling, enabling a truly real-time application state. The backend maintains an active registry mapping `userIds` to their respective `socket.ids`.

Key socket events implemented:
- `registerUser`: Binds a user's database ID to their active WebSocket connection upon login.
- `privateMessage`: Routes instant text messages efficiently from sender to a specific recipient's active socket, alongside pushing a real-time `notif` event.
- `Typing`: Emits a `TypingStatus` payload directly to the receiver's socket when the sender is actively composing a message.
- `seen`: Broadcasts read receipts (`seen_status`) instantly when a message enters the recipient's viewport.
- `DeleteMessage`: Instantly removes messages from the recipient's DOM if deleted by the sender, emitting a `DeleteConfirm` event.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (Local or Atlas)
- Cloudinary Account (for image hosting)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Connectify
   ```

2. **Install Root Dependencies**
   The root folder uses `concurrently` to run both frontend and backend simultaneously.
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables
Create a `.env` file in the `backend` directory with the following credentials:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secure-jwt-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

### Running the Application
From the **root directory** (`Connectify/`), you can start both the client and server concurrently using the root package scripts:

```bash
npm run both
```

- The **Frontend** will start on `http://localhost:3000`
- The **Backend** will start on `http://localhost:5000`

---
*Built by [Yash Limbachiya](https://github.com/Yash8270)*
