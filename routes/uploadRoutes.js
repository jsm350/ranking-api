const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const uploadController = require('../controllers/uploadController');

router.post('/', [authenticateToken, uploadController.upload], uploadController.saveImage);

module.exports = router;