/* userRoutes */
const express = require('express');
const { login, checkEmailExists, checkNicknameExists, register } = require('../controllers/userController');
const upload = require('../middlewares/upload');

const router = express.Router();

// 로그인 엔드포인트
router.post('/login', login);

// 이메일 중복 체크
router.get('/email/check', checkEmailExists);

// 닉네임 중복 체크
router.get('/nickname/check', checkNicknameExists);

// 회원가입 엔드포인트
router.post('/signup', upload.single('profile_photo'), register);

module.exports = router;