const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectToMongo = require('./db');
const http = require('http');
const {Server} = require('socket.io');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ['GET','POST','PATCH','DELETE','PUT'],
        credentials: true
    }
})

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


connectToMongo();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/post', require('./routes/post'));
app.use('/api/follow', require('./routes/follow'));
app.use('/api/chat', require('./routes/chat')); 

const users = {}; // Map to store user IDs and their socket IDs

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register user
  socket.on('registerUser', (userId) => {
    users[userId] = socket.id; // Map userId to socket.id
    console.log(`${userId} registered with socket ID: ${socket.id}`);
  });

  // Handle private messages
  socket.on('privateMessage', ({ recipientId, message, senderId }) => {
    const recipientSocketId = users[recipientId];
    if (recipientSocketId) {
      // Send the message to the recipient
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
  });

  socket.on('Typing', (data) => {
    const { userid, receiverid, TypingStatus } = data;

    // Look up the receiver's socket ID
    const receiverSocketId = users[receiverid];

    if (receiverSocketId) {
      // Emit TypingStatus to the receiver only
      io.to(receiverSocketId).emit('TypingStatus', {
        userid,       // Sender's ID
        TypingStatus: TypingStatus, // Typing state (true/false)
      });
      console.log(`Typing status sent from ${userid} to ${receiverid}`);
    } else {
      console.log(`User ${receiverid} is not online.`);
    }
  });

  socket.on('seen', (data) => {
    const { userid, receiverid, seen } = data;

    // Look up the receiver's socket ID
    const receiverSocketId = users[receiverid];

    if (receiverSocketId) {
      // Emit TypingStatus to the receiver only
      io.to(receiverSocketId).emit('seen_status', {
        userid,       // Sender's ID
        seen: seen, // Typing state (true/false)
      });
      console.log(`Seen status sent from ${userid} to ${receiverid}`);
    } else {
      console.log(`User ${receiverid} is not online.`);
    }
  });

  socket.on('DeleteMessage', (data) => {
    const { userid, receiverid, size } = data;

    // Look up the receiver's socket ID
    const receiverSocketId = users[receiverid];

    if (receiverSocketId) {
      // Emit TypingStatus to the receiver only
      io.to(receiverSocketId).emit('DeleteConfirm', {
        userid:userid,
        receiverid: receiverid,   // Sender's ID   
        size: size
      });
      console.log(`Deleted Message from ${userid} to ${receiverid}`);
    } else {
      console.log(`User ${receiverid} is not online.`);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId]; // Remove from the map
        console.log(`${userId} disconnected.`);
        break;
      }
    }
  });
});



server.listen(5000, () => console.log("Server running on 5000"));