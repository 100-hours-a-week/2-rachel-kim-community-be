/* userController.js */

const { findUserByEmail, verifyPassword } = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        // 성공 응답
        res.json({
            status: 200,
            message: "login_success",
            data: {
                user_id: user.id,
                email: user.email,
                nickname: user.nickname,
                created_at: user.created_at,
                updated_at: user.updated_at,
                deleted_at: user.deleted_at || null,
                auth_token: token,
            },
        });
    } catch (error) {
        console.error('로그인 처리 오류:', error);
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

module.exports = { login };