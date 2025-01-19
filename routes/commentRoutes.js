/* commentRoutes.js */
import express from 'express';
import { authenticateSession } from '../middlewares/authMiddleware.js';
import { getPostComments, createComment, editComment, removeComment } from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true }); // 상위 경로의 params를 포함

// 댓글 목록 조회
router.get('/', getPostComments); 

// 댓글 등록
router.post('/', authenticateSession, createComment); 

// 댓글 수정
router.patch('/:comment_id', authenticateSession, editComment); 

// 댓글 삭제
router.delete('/:comment_id', authenticateSession, removeComment); 

export default router;