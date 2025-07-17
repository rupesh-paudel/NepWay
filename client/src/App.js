import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './nepali-scenes.css';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <div className="App">
      {/* Nepali Scenic Background */}
      <div className="nepali-scenic-bg">
        <div className="scenic-slides scenic-slide-1"></div>
        <div className="scenic-slides scenic-slide-2"></div>
        <div className="scenic-slides scenic-slide-3"></div>
        <div className="scenic-slides scenic-slide-4"></div>
        <div className="scenic-slides scenic-slide-5"></div>
        <div className="scenic-slides scenic-slide-6"></div>
      </div>

      {/* Floating Nepal Cultural Elements */}
      <div className="nepal-elements">
        <div className="floating-element">🏔️</div>
        <div className="floating-element">🛕</div>
        <div className="floating-element">🏞️</div>
        <div className="floating-element">🚗</div>
        <div className="floating-element">🌸</div>
        <div className="floating-element">⛰️</div>
      </div>

      <Router>
        <div className="App">
          <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
          <Routes>
            <Route 
              path="/" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} 
            />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
