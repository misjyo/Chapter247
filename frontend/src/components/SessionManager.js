import React, { useEffect, useState, useCallback } from 'react';
import SessionWarningModal from './SessionWarningModal';

const TOKEN_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes for token expiry
const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutes for inactivity
const WARNING_TIME = 1 * 60 * 1000; // 1 minute warning before action

const SessionManager = ({ user, onLogout, onExtendSession, children }) => {
  const [showTokenWarning, setShowTokenWarning] = useState(false);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_TIME / 1000);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Get login time from localStorage or set it if user just logged in
  const getLoginTime = useCallback(() => {
    const storedLoginTime = localStorage.getItem('loginTime');
    if (storedLoginTime) {
      return parseInt(storedLoginTime, 10);
    }
    // Set login time if user exists but no loginTime is stored
    if (user?.token) {
      const loginTime = Date.now();
      localStorage.setItem('loginTime', loginTime.toString());
      return loginTime;
    }
    return null;
  }, [user?.token]);

  const handleUserActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowInactivityWarning(false);
  }, []);

  const handleExtendSession = useCallback(() => {
    // Reset both token and inactivity timers
    const newLoginTime = Date.now();
    localStorage.setItem('loginTime', newLoginTime.toString());
    setLastActivity(newLoginTime);
    setShowTokenWarning(false);
    setShowInactivityWarning(false);
    onExtendSession?.();
  }, [onExtendSession]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('loginTime');
    setShowTokenWarning(false);
    setShowInactivityWarning(false);
    onLogout();
  }, [onLogout]);

  // Token expiry timer (10 minutes from actual login time, survives refresh)
  useEffect(() => {
    if (!user?.token) return;

    const loginTime = getLoginTime();
    if (!loginTime) return;

    const checkTokenExpiry = () => {
      const timeSinceLogin = Date.now() - loginTime;
      const timeUntilExpiry = TOKEN_EXPIRY_TIME - timeSinceLogin;
      const timeUntilWarning = timeUntilExpiry - WARNING_TIME;

      if (timeSinceLogin >= TOKEN_EXPIRY_TIME) {
        // Token already expired
        handleLogout();
      } else if (timeSinceLogin >= (TOKEN_EXPIRY_TIME - WARNING_TIME)) {
        // Show warning if within warning period
        const remainingTime = TOKEN_EXPIRY_TIME - timeSinceLogin;
        setTimeLeft(Math.floor(remainingTime / 1000));
        setShowTokenWarning(true);
      } else {
        // Schedule warning for later
        const warningTimer = setTimeout(() => {
          setShowTokenWarning(true);
          setTimeLeft(WARNING_TIME / 1000);
        }, timeUntilWarning);

        return () => clearTimeout(warningTimer);
      }
    };

    // Check immediately and then every second
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 1000);

    return () => clearInterval(interval);
  }, [user?.token, getLoginTime, handleLogout]);

  // Inactivity timer (5 minutes without activity)
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      if (timeSinceLastActivity >= INACTIVITY_TIME && !showInactivityWarning && !showTokenWarning) {
        setShowInactivityWarning(true);
        setTimeLeft(WARNING_TIME / 1000);
      }
    };

    // Check inactivity every second
    const interval = setInterval(checkInactivity, 1000);

    return () => clearInterval(interval);
  }, [user, lastActivity, showInactivityWarning, showTokenWarning]);

  // Countdown timer for warnings
  useEffect(() => {
    if (!showTokenWarning && !showInactivityWarning) return;

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showTokenWarning, showInactivityWarning, handleLogout]);

  // User activity listeners
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      handleUserActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, handleUserActivity]);

  // Clear login time when user logs out
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('loginTime');
    }
  }, [user]);

  const getWarningType = () => {
    if (showTokenWarning) return 'token';
    if (showInactivityWarning) return 'inactivity';
    return null;
  };

  const warningType = getWarningType();

  return (
    <>
      {warningType && (
        <SessionWarningModal
          warningType={warningType}
          timeLeft={timeLeft}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      )}
      {children}
    </>
  );
};

export default SessionManager;