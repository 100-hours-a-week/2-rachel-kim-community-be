/* postRoutes.js */
const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getPostsList, getPostDetail, removePost, createPost, updatePost } = require('../controllers/postController');
const router = express.Router();
const upload = require('../middlewares/upload');

// 게시글 목록 조회
router.get('/', getPostsList);
// 게시글 상세 조회
router.get('/:post_id', getPostDetail); 
// 게시글 삭제
router.delete('/:post_id', authenticateToken, removePost); 
// 게시글 추가
router.post('/new', authenticateToken, upload.single('attachFilePath'), createPost);
// 게시글 수정
router.patch('/:post_id', authenticateToken, upload.single('attachFilePath'), updatePost);

module.exports = router;