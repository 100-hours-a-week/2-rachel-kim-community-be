/* postRoutes.js */
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
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
router.delete('/:post_id', authenticateToken, removePost); 

// 게시글 추가
router.post('/new', authenticateToken, upload.single('attachFilePath'), createPost);

// 게시글 수정
router.patch('/:post_id', authenticateToken, upload.single('attachFilePath'), updatePost);

// 좋아요 상태 확인
router.get('/:post_id/like-status', authenticateToken, checkLikeStatus);

// 좋아요 토글
router.post('/:post_id/like', authenticateToken, toggleLike);
router.delete('/:post_id/like', authenticateToken, toggleLike);

// 조회수 업데이트
router.post('/:post_id/view', authenticateToken, updatePostView);

export default router;