/* userRoutes */
import express from 'express';
import { 
    login, 
    getAuthStatus,
    getUserById,
    register, 
    checkEmailExists, 
    checkNicknameForSignup, 
    logout,
    updateUser,
    checkNicknameForUpdate, 
    deleteUser, 
    changePassword,
} from '../controllers/userController.js';
import upload from '../middlewares/upload.js';
import { authenticateSession } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 로그인 
router.post('/login', login);
// 로그인 상태 확인 (클라이언트용)
router.get('/auth/status', getAuthStatus);
// 인증된 사용자 확인
router.get('/protected', authenticateSession, (req, res) => {
    res.status(200).json({
        message: '인증된 사용자입니다.',
        user: req.user,
    });
});
// 유저 정보 조회
router.get('/:user_id', authenticateSession, getUserById);
// 회원 가입 
router.post('/signup', upload.single('profilePhoto'), register);
// 닉네임 중복 체크 (회원가입)
router.get('/nickname/check/signup', checkNicknameForSignup);
// 로그아웃
router.post('/logout', authenticateSession, logout);
// 회원 정보 수정
router.patch('/:user_id', authenticateSession, upload.single('profilePhoto'), updateUser);
// 이메일 중복 체크
router.get('/email/check', checkEmailExists);
// 닉네임 중복 체크 (회원정보 수정)
router.get('/nickname/check/update', authenticateSession, checkNicknameForUpdate);
// 회원 정보 삭제
router.delete('/:user_id', authenticateSession, deleteUser);
// 비밀번호 변경
router.patch('/:user_id/password', authenticateSession, changePassword);

export default router;