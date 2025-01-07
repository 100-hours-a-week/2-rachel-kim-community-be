/* userRoutes */
const express = require('express');
const { login, checkEmailExists, checkNicknameExists, register, getUserById, updateUser } = require('../controllers/userController');
const upload = require('../middlewares/upload');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// 로그인 
router.post('/login', login);

// 이메일 중복 체크
router.get('/email/check', checkEmailExists);

// 닉네임 중복 체크
router.get('/nickname/check', authenticateToken, checkNicknameExists);

// 회원 가입 
router.post('/signup', upload.single('profilePhoto'), register);

// 유저 정보 조회
router.get('/:user_id', authenticateToken, getUserById);

// 회원 정보 수정
router.patch('/:user_id', authenticateToken, upload.single('profilePhoto'), updateUser);

module.exports = router;