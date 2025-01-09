/* userController.js */
const { findUserByEmail, verifyPassword, findUserByNickname, saveUser, getUsers, saveUsers } = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { updatePostsByUserId } = require('../models/postModel');
const { updateCommentsByUserId } = require('../models/commentModel');

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

// 로그인 상태 확인
const checkAuthStatus = (req, res) => {
    // req.user가 없으면 인증 실패 처리
    if (!req.user) {
        return res.status(401).json({ status: 401, message: "user_not_authenticated" });
    }

    // 인증 성공 시 사용자 정보 반환
    res.status(200).json({
        status: 200,
        message: null,
        data: {
            user_id: req.user.user_id,
            email: req.user.email,
            nickname: req.user.nickname,
        },
    });
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
    const { user_id } = req.user

    if (!nickname) {
        return res.status(400).json({
            status: 400,
            message: "required_nickname",
            data: null,
        });
    }

    try {
        const user = findUserByNickname(nickname);
        // 닉네임이 존재하지만 본인의 닉네임이 아닌 경우
        if (user && user.user_id !== user_id) {
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

// 회원 가입 응답
const register = async (req, res) => {
    const { email, password, nickname } = req.body;
    const profile_image_path = req.file ? `/public/image/profile/${req.file.filename}` : null;

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
            profile_image_path,
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

// 유저 정보 조회
const getUserById = (req, res) => {
    const { user_id } = req.params; 
    const users = getUsers();
   
    if (!user_id || isNaN(user_id)) {
        return res.status(400).json({
            status: 400,
            message: "invalid_user_id",
            data: null,
        });
    }

    const user = users.find(user => user.user_id === Number(user_id));

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: "not_found_user",
            data: null,
        });
    }

    return res.status(200).json({
        status: 200,
        message: "get_user_success",
        data: {
            user_id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profile_image_path: user.profile_image_path,
        },
    });
};

// 회원 정보 수정
const updateUser = (req, res) => {
    const { user_id } = req.params;
    const { user_id: authenticatedUserId } = req.user;
    const { nickname } = req.body;
    const profile_image_path = req.file ? `/public/image/profile/${req.file.filename}` : null;

    if (!user_id) {
        return res.status(400).json({ status: 400, message: "invalid_user_id", data: null });
    }

    if (!nickname) {
        return res.status(400).json({ status: 400, message: "nickname_required", data: null });
    }

    if (nickname.length > 10) {
        return res.status(400).json({ status: 400, message: "invalid_nickname_length", data: null });
    }

    if (Number(user_id) !== authenticatedUserId) {
        return res.status(403).json({ message: "required_permission" });
    }

    try {
        const users = getUsers();
        const userIndex = users.findIndex(user => user.user_id === Number(user_id));

        // 사용자 정보 업데이트
        users[userIndex] = {
            ...users[userIndex],
            nickname,
            profile_image_path: profile_image_path || users[userIndex].profile_image_path,
            updated_at: new Date().toISOString(),
        };

        saveUsers(users);

        // 게시글과 댓글 데이터 업데이트
        const updatedData = { nickname, profile_image_path };
        updatePostsByUserId(Number(user_id), updatedData);
        updateCommentsByUserId(Number(user_id), updatedData);

        return res.status(200).json({
            status: 200,
            message: "update_profile_success",
            data: { user_id: Number(user_id) },
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 회원 정보 삭제
const deleteUser = (req, res) => {
    const { user_id } = req.params;
    const { user_id: authenticatedUserId } = req.user;

    if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ status: 400, message: "invalid_user_id", data: null });
    }
    if (Number(user_id) !== authenticatedUserId) {
        return res.status(403).json({ status: 403, message: "required_permission", data: null });
    }

    try {
        const users = getUsers();
        const userIndex = users.findIndex(user => user.user_id === Number(user_id));

        if (userIndex === -1) {
            return res.status(404).json({ status: 404, message: "not_found_user", data: null });
        }

        // 유저를 삭제 상태로 업데이트 (소프트 삭제)
        // users[userIndex].deleted_at = new Date().toISOString();

        // 배열에서 유저를 제거 (하드 삭제)
        users.splice(userIndex, 1);
        saveUsers(users);
        
        return res.status(200).json({ status: 200, message: "delete_user_data_success", data: null });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 비밀번호 변경
const changePassword = (req, res) => {
    const { user_id } = req.params;
    const { password, confirmPassword } = req.body;
    const { user_id: authenticatedUserId } = req.user;

    if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ status: 400, message: "invalid_user_id", data: null });
    }
    if (!password || !confirmPassword) {
        return res.status(400).json({ status: 400, message: "empty_password_field", data: null });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ status: 400, message: "passwords_do_not_match", data: null });
    }
    if (Number(user_id) !== authenticatedUserId) {
        return res.status(403).json({ status: 403, message: "required_permission", data: null });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ status: 400, message: "invalid_password_format", data: null });
    }

    const users = getUsers();
    const userIndex = users.findIndex(user => user.user_id === Number(user_id));

    // 비밀번호 해시화
    bcrypt.hash(password, 10)
        .then(hashedPassword => {
            users[userIndex].password = hashedPassword;
            users[userIndex].updated_at = new Date().toISOString();
            saveUsers(users);

            res.status(201).json({ status: 201, message: "change_user_password_success", data: null });
        })
        .catch(error => {
            console.error('비밀번호 해싱 실패:', error.message);
            res.status(500).json({ status: 500, message: "internal_server_error", data: null });
        });
};

module.exports = { login, checkAuthStatus, checkEmailExists, checkNicknameExists, register, updateUser, getUserById, deleteUser, changePassword };
