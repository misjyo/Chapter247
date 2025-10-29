const express = require('express');
const { signup, login, getTestCredentials } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/test-credentials', getTestCredentials);

module.exports = router;