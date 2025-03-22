// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';

// Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import SessionsList from './pages/SessionsList';

// Styles
import './App.css'; // تأكد من وجود هذا الملف في نفس المجلد مع App.js

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/session/:sessionId" element={<Session />} />
                  <Route path="/sessions" element={<SessionsList />} />
                </Route>
                
                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;