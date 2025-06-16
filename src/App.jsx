import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Ingest from './components/Ingest';
import Summarize from './components/Summarize';
import Quiz from './components/Quiz';
import Recommend from './components/Recommend';
import ProtectedRoute from './ProtectedRoute';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on initial render
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute user={user}>
                <Chat user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ingest"
            element={
              <ProtectedRoute user={user}>
                <Ingest user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summarize"
            element={
              <ProtectedRoute user={user}>
                <Summarize user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute user={user}>
                <Quiz user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommend"
            element={
              <ProtectedRoute user={user}>
                <Recommend user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;