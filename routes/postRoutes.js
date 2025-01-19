/* postRoutes.js */
import express from 'express';
import { authenticateSession } from '../middlewares/authMiddleware.js';
import { 
    getPostsList, 
    getPostDetail, 
    removePost, 
    createPost, 
    updatePost, 
    checkLikeStatus, 
    toggleLike, 
    updatePostView 
} from '../controllers/postController.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// 게시글 목록 조회
router.get('/', getPostsList);

// 게시글 상세 조회
router.get('/:post_id', getPostDetail); 

// 게시글 삭제
router.delete('/:post_id', authenticateSession, removePost); 

// 게시글 추가
router.post('/new', authenticateSession, upload.single('attachFilePath'), createPost);

// 게시글 수정
router.patch('/:post_id', authenticateSession, upload.single('attachFilePath'), updatePost);

// 좋아요 상태 확인
router.get('/:post_id/like-status', authenticateSession, checkLikeStatus);

// 좋아요 토글
router.post('/:post_id/like', authenticateSession, toggleLike);
router.delete('/:post_id/like', authenticateSession, toggleLike);

// 조회수 업데이트
router.post('/:post_id/view', authenticateSession, updatePostView);

export default router;