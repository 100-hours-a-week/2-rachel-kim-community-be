/* postRoutes.js */
const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getPostsList, getPostDetail, removePost } = require('../controllers/postController');
const router = express.Router();

// 게시글 목록 조회
router.get('/', getPostsList);
// 게시글 상세 조회
router.get('/:post_id', getPostDetail); 
// 게시글 삭제
router.delete('/:post_id', authenticateToken, removePost); 

module.exports = router;