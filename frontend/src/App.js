import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import TaskManager from './pages/TaskManager';
import SessionManager from './components/SessionManager';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
  }, []);

  const setUserAndStore = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Set login timestamp when user logs in
    localStorage.setItem('loginTime', Date.now().toString());
  }, []);

  const handleExtendSession = useCallback(() => {
    // This will be called when user clicks "Extend Session"
    // The actual token refresh logic would go here
    console.log('Session extended by user');
  }, []);

  return (
    <SessionManager
      user={user}
      onLogout={logout}
      onExtendSession={handleExtendSession}
    >
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup setUser={setUserAndStore} />} />
          <Route path="/login" element={<Login setUser={setUserAndStore} />} />
          <Route 
            path="/tasks" 
            element={
              user?.token ? (
                <TaskManager user={user} logout={logout} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="/" element={<Navigate to={user?.token ? "/tasks" : "/login"} />} />
        </Routes>
      </Router>
    </SessionManager>
  );
}

export default App;