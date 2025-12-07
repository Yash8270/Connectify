const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectToMongo = require('./db');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const server = http.createServer(app);

// ✅✅✅ CORRECT FRONTEND ORIGINS (NO TRAILING SLASH)
const allowedOrigins = [
  "http://localhost:3000",
  "https://yash-limbachiya-connectify.vercel.app"
];

// ✅✅✅ EXPRESS CORS (FIXES REST API)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS BLOCKED: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅✅✅ REQUIRED FOR PATCH/DELETE PREFLIGHT
app.options("*", cors());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅✅✅ CONNECT DATABASE
connectToMongo();

// ✅✅✅ ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/post', require('./routes/post'));
app.use('/api/follow', require('./routes/follow'));
app.use('/api/chat', require('./routes/chat'));

// ✅✅✅ SOCKET.IO CORS (FIXES CHAT + REALTIME)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅✅✅ SOCKET USER MAP
const users = {};

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('registerUser', (userId) => {
    users[userId] = socket.id;
    console.log(`${userId} registered with socket ID: ${socket.id}`);
  });

  socket.on('privateMessage', ({ recipientId, message, senderId }) => {
    try {
      const recipientSocketId = users[recipientId];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', {
          sender: senderId,
          text: message,
        });

        io.to(recipientSocketId).emit('notif', {
          sender: senderId,
          text: message
        });

        console.log(`${senderId} sent to ${recipientId}: ${message}`);
      } else {
        console.log(`${recipientId} is not connected.`);
      }
    } catch (error) {
      console.log("Socket privateMessage error:", error);
    }
  });

  socket.on('Typing', (data) => {
    try {
      const { userid, receiverid, TypingStatus } = data;
      const receiverSocketId = users[receiverid];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('TypingStatus', {
          userid,
          TypingStatus,
        });
        console.log(`Typing status sent from ${userid} to ${receiverid}`);
      }
    } catch (error) {
      console.log("Typing socket error:", error);
    }
  });

  socket.on('seen', (data) => {
    try {
      const { userid, receiverid, seen } = data;
      const receiverSocketId = users[receiverid];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('seen_status', {
          userid,
          seen,
        });
        console.log(`Seen status sent from ${userid} to ${receiverid}`);
      }
    } catch (error) {
      console.log("Seen socket error:", error);
    }
  });

  socket.on('DeleteMessage', (data) => {
    try {
      const { userid, receiverid, size } = data;
      const receiverSocketId = users[receiverid];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('DeleteConfirm', {
          userid,
          receiverid,
          size
        });
        console.log(`Deleted Message from ${userid} to ${receiverid}`);
      }
    } catch (error) {
      console.log("Delete socket error:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`${userId} disconnected.`);
        break;
      }
    }
  });
});

// ✅✅✅ HEALTH CHECK (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully");
});

server.listen(5000, () => console.log("✅ Server running on port 5000"));
