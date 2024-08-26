const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require("../middlewares/authMiddleware");
router.post('/login', authController.login);
router.get('/me/:token',authenticateToken, authController.me);

module.exports = router;
