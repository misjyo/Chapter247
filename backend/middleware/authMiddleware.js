const axios = require('axios');

const API = 'https://dummyjson.com';

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(403).json({ message: 'Access token required' });
  }

  try {
    const response = await axios.get(`${API}/auth/me`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    req.user = response.data;
    req.token = token;
    next();
    
  } catch (error) {
    res.status(403).json({ 
      message: 'Invalid or expired token',
      error: error.response?.data?.message || 'Authentication failed'
    });
  }
};