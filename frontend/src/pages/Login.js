import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'

function Login({ setUser }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [testCredentials, setTestCredentials] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestCredentials = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/test-credentials');
        setTestCredentials(res.data);
      } catch (error) {
        setTestCredentials([
          { username: 'emilys', password: 'emilyspass', description: 'Demo User' }
        ]);
      }
    };

    fetchTestCredentials();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (!res.data.token) {
        throw new Error('Authentication failed');
      }
      
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/tasks');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useTestCredentials = (username, password) => {
    setFormData({ username, password });
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              value={formData.username}
              onChange={handleChange} 
              required 
              disabled={loading}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange} 
              required 
              disabled={loading}
              className="form-input"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {testCredentials.length > 0 && (
          <div className="test-credentials">
            <h4>Demo Accounts</h4>
            {testCredentials.map((cred, index) => (
              <button 
                key={index}
                onClick={() => useTestCredentials(cred.username, cred.password)}
                className="credential-btn"
              >
                <strong>{cred.username}</strong>
                <span>{cred.description}</span>
              </button>
            ))}
          </div>
        )}

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;