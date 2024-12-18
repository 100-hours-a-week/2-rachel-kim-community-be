/* postRoutes.js */
const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { getPostsList, getPostDetail, getPostComments, createComment, editComment, removeComment, removePost } = require('../controllers/postController');
const router = express.Router();

// 게시글 목록 조회
router.get('/', getPostsList);
// 게시글 상세 조회
router.get('/:post_id', getPostDetail); 
// 댓글 목록 조회
router.get('/:post_id/comments', getPostComments); 
// 댓글 등록
router.post('/:post_id/comments', authenticateToken, createComment); 
// 댓글 수정
router.patch('/:post_id/comments/:comment_id', authenticateToken, editComment); 
// 댓글 삭제
router.delete('/:post_id/comments/:comment_id', authenticateToken, removeComment); 
// 게시글 삭제
router.delete('/:post_id', removePost); 

module.exports = router;