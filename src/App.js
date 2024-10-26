// src/App.js

import React from 'react';
import Chat from './components/Chat';
import './App.css'; // Add any global styles you want here

function App() {
  return (
    <div className="App">
      <h1>Welcome to the Real-Time Chat Application</h1>
      <Chat />
    </div>
  );
}

export default App;
