// Import necessary packages
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Use Server from socket.io
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',  // In production, replace '*' with your frontend URL
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://imsaran018:saran018@ispark.lvqhd.mongodb.net/chatdb?retryWrites=true&w=majority&appName=iSpark';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.log('MongoDB connection error:', err));

// Define the Chat Schema
const chatSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

// Create Chat Model
const Chat = mongoose.model('Chat', chatSchema);

// Load chat history (REST API)
app.get('/api/chat', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 });
    res.json(chats);
  } catch (err) {
    res.status(500).send('Error retrieving chat history');
  }
});

// Socket.IO events for real-time communication
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle receiving a new message
  socket.on('sendMessage', async (messageData) => {
    try {
      // Save the message to MongoDB
      const chat = new Chat({
        username: messageData.username,
        message: messageData.message
      });
      await chat.save();

      // Broadcast the message to all connected clients
      io.emit('receiveMessage', {
        username: messageData.username,
        message: messageData.message,
        timestamp: chat.timestamp,
      });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
