const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const {authenticateToken} = require("../middlewares/authMiddleware");

router.post('/', imageController.upload, imageController.store);
router.get('/', authenticateToken, imageController.index);
router.delete('/:imageName', authenticateToken, imageController.destroy);

module.exports = router;