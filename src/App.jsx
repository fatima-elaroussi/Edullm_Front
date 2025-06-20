// App.jsx - Enhanced with layouts and better routing
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Components
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';

// Protected Components
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import Ingest from './components/Ingest';
import Summarize from './components/Summarize';
import Quiz from './components/Quiz';
import Recommend from './components/Recommend';
import Profile from './components/Profile';
import Documents from './components/Documents';
import Statistics from './components/Statistics';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ResourceManagement from './components/admin/ResourceManagement';
import DocumentManagement from './components/admin/DocumentManagement';

// Utils

import ProtectedRoute from './utils/ProtectedRoute';
import AdminRoute from './utils/AdminRoute';
import { UserProvider } from './contexts/UserContext';
// import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="login" element={<Login setUser={setUser} />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Protected User Routes */}
            <Route path="/app" element={
              <ProtectedRoute user={user}>
                <DashboardLayout user={user} setUser={setUser} />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard user={user} />} />
              <Route path="chat" element={<Chat user={user} />} />
              <Route path="ingest" element={<Ingest user={user} />} />
              <Route path="summarize" element={<Summarize user={user} />} />
              <Route path="quiz" element={<Quiz user={user} />} />
              <Route path="recommend" element={<Recommend user={user} />} />
              <Route path="documents" element={<Documents user={user} />} />
              <Route path="profile" element={<Profile user={user} setUser={setUser} />} />
              <Route path="statistics" element={<Statistics user={user} />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute user={user}>
                <AdminLayout user={user} setUser={setUser} />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="resources" element={<ResourceManagement />} />
              <Route path="documents" element={<DocumentManagement />} />
            </Route>
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;