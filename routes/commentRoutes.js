/* commentRoutes.js */
const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getPostComments, createComment, editComment, removeComment } = require('../controllers/commentController');
const router = express.Router({ mergeParams: true }); // 상위 경로의 params를 포함

// 댓글 목록 조회
router.get('/', getPostComments); 
// 댓글 등록
router.post('/', authenticateToken, createComment); 
// 댓글 수정
router.patch('/:comment_id', authenticateToken, editComment); 
// 댓글 삭제
router.delete('/:comment_id', authenticateToken, removeComment); 

module.exports = router;