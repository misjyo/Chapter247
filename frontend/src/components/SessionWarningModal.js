import React from 'react';

const SessionWarningModal = ({ warningType, timeLeft, onExtend, onLogout }) => {
  const getWarningConfig = () => {
    const configs = {
      token: {
        title: 'Session Expiring',
        message: 'Your session token will expire in',
        headerClass: 'token',
        headerColor: '#856404',
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7'
      },
      inactivity: {
        title: 'Inactivity Warning',
        message: 'You will be logged out due to inactivity in',
        headerClass: 'inactivity',
        headerColor: '#0c5460',
        backgroundColor: '#d1ecf1',
        borderColor: '#bee5eb'
      }
    };
    return configs[warningType] || configs.token;
  };

  const config = getWarningConfig();

  return (
    <div className="modal-overlay">
      <div className="warning-modal">
        <div 
          className={`warning-header ${config.headerClass}`}
          style={{
            background: config.backgroundColor,
            borderBottom: `1px solid ${config.borderColor}`
          }}
        >
          <h3 style={{ color: config.headerColor }}>{config.title}</h3>
        </div>
        <div className="warning-body">
          <p>{config.message} <strong>{timeLeft} seconds</strong></p>
          <p>Would you like to extend your session?</p>
        </div>
        <div className="warning-actions">
          <button 
            onClick={onLogout}
            className="btn-logout-warning"
          >
            Logout Now
          </button>
          <button 
            onClick={onExtend}
            className="btn-extend"
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;