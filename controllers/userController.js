/* userController.js */
const { findUserByEmail, verifyPassword, findUserByNickname, saveUser } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 로그인 응답
const login = (req, res) => {
    const { email, password } = req.body;

    // 필수 입력값 검증
    if (!email) {
        return res.status(400).json({ status: 400, message: "required_email", data: null });
    }
    if (!password) {
        return res.status(400).json({ status: 400, message: "required_password", data: null });
    }

    try {
        // 사용자 조회
        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ status: 401, message: "invalid_email_or_password", data: null });
        }

        // 비밀번호 검증
        const isPasswordValid = verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 401, message: "invalid_email_or_password", data: null });
        }

        // JWT 토큰 생성 
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                nickname: user.nickname, 
                profile_image_path: user.profile_image_path, 
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );
        console.log('JWT 생성 데이터:', { user_id: user.user_id, email: user.email });

        // 성공 응답
        res.json({
            status: 200,
            message: "login_success",
            data: {
                user_id: user.user_id,
                email: user.email,
                nickname: user.nickname,
                created_at: user.created_at,
                updated_at: user.updated_at,
                deleted_at: user.deleted_at || null,
                auth_token: token,
            },
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 이메일 중복 체크
const checkEmailExists = (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({
            status: 400,
            message: "required_email",
            data: null,
        });
    }

    try {
        const user = findUserByEmail(email);
        if (user) {
            return res.status(409).json({
                status: 409,
                message: "already_exist_email",
                data: null,
            });
        }

        return res.status(200).json({
            status: 200,
            message: "available_email",
            data: null,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "internal_server_error",
            data: null,
        });
    }
};

// 닉네임 중복 체크
const checkNicknameExists = (req, res) => {
    const { nickname } = req.query;

    if (!nickname) {
        return res.status(400).json({
            status: 400,
            message: "required_nickname",
            data: null,
        });
    }

    try {
        const user = findUserByNickname(nickname);
        if (user) {
            return res.status(409).json({
                status: 409,
                message: "already_exist_nickname",
                data: null,
            });
        }

        return res.status(200).json({
            status: 200,
            message: "available_nickname",
            data: null,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "internal_server_error",
            data: null,
        });
    }
};

// 회원가입 응답
const register = async (req, res) => {
    const { email, password, nickname } = req.body;
    const profileImagePath = req.file ? `/public/image/profile/${req.file.filename}` : null;

    // 필수 입력값 검증
    if (!email) return res.status(400).json({ status: 400, message: "required_email", data: null });
    if (!password) return res.status(400).json({ status: 400, message: "required_password", data: null });
    if (!nickname) return res.status(400).json({ status: 400, message: "required_nickname", data: null });

    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 저장
        const userId = saveUser({
            email,
            password: hashedPassword,
            nickname,
            profileImagePath,
        });

        res.status(201).json({
            status: 201,
            message: "register_success",
            data: { userId, profile_image_id: userId }, // 임의로 userId를 이미지 ID로 설정
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

module.exports = { login, checkEmailExists, checkNicknameExists, register };