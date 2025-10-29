const axios = require('axios');

const API = 'https://dummyjson.com';

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const response = await axios.post(`${API}/auth/login`, {
      username,
      password,
      expiresInMins: 30
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    const { id, username: responseUsername, email, firstName, lastName, accessToken, refreshToken } = response.data;

    res.status(200).json({ 
      token: accessToken,
      refreshToken,
      userId: id, 
      username: responseUsername,
      firstName,
      lastName,
      email,
      source: 'dummyjson'
    });

  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Login failed';
    
    res.status(status).json({ 
      message,
      error: 'Authentication error'
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    const response = await axios.post(`${API}/users/add`, {
      username,
      password,
      email,
      firstName: firstName || username,
      lastName: lastName || 'User',
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    const loginResponse = await axios.post(`${API}/auth/login`, {
      username,
      password,
      expiresInMins: 30
    });

    const { id, accessToken, refreshToken } = loginResponse.data;

    res.status(201).json({ 
      token: accessToken,
      refreshToken,
      userId: id, 
      username,
      firstName: firstName || username,
      lastName: lastName || 'User',
      email,
      source: 'dummyjson'
    });

  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Signup failed';
    
    res.status(status).json({ 
      message,
      error: 'Registration error'
    });
  }
};

exports.getTestCredentials = async (req, res) => {
  try {
    const testCredentials = [
      { username: 'emilys', password: 'emilyspass', description: 'Demo User' },
      { username: 'kminchelle', password: '0lelplR', description: 'Test User' },
      { username: 'atuny0', password: '9uQFF1Lh', description: 'Test User' }
    ];
    
    res.status(200).json(testCredentials);
  } catch (error) {
    res.status(500).json({ message: 'Error getting test credentials' });
  }
};