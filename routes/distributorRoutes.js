const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');
const {authenticateToken} = require("../middlewares/authMiddleware");

router.post('/', distributorController.store);
router.get('/', distributorController.index);
router.get('/:distributorSlug', distributorController.show);
router.delete('/:distributorId', authenticateToken, distributorController.destroy);

module.exports = router;