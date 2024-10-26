// src/components/Chat.js

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import './Chat.css';

// Initialize Socket.io Client with the Render backend URL
const socket = io('https://chat-app-2-w8wl.onrender.com');

const Chat = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch chat history when component mounts
  useEffect(() => {
    axios.get('https://chat-app-2-w8wl.onrender.com/api/chat')
      .then((response) => {
        setChatMessages(response.data);
      })
      .catch((err) => console.error('Error fetching chat history:', err));
  }, []);

  // Listen to incoming chat messages
  useEffect(() => {
    socket.on('receiveMessage', (messageData) => {
      setChatMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  // Handle message submission
  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const messageData = { username, message };
      socket.emit('sendMessage', messageData);
      setMessage(''); // Clear the message input after sending
    }
  };

  // Handle user login
  const handleLogin = () => {
    if (username.trim() !== '') {
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="chat-container">
      {!isLoggedIn ? (
        <div className="login-container">
          <h2>Join the Chat</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <button onClick={handleLogin}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-box">
          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className="message">
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="message-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
