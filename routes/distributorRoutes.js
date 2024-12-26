const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const {authenticateToken} = require("../middlewares/authMiddleware");

router.post('/', distributorController.store);
router.get('/', authenticateToken, distributorController.index);
router.delete('/:distributorId', authenticateToken, distributorController.destroy);

module.exports = router;