const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const articleController = require('../controllers/articleController');

router.get('/articles/:id',authenticateToken, articleController.getArticleById);
router.get('/article/:slug', articleController.getArticleBySlug);
router.post('/articles/:id', authenticateToken, articleController.addArticleByProducer);

module.exports = router;