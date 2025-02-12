/* userController.js */
import { findUserByEmail, 
         findUserByNickname, 
         verifyPassword,
         saveUser, 
         updateUser as updateUserModel,
         deleteUser as deleteUserModel,
 } from '../models/userModel.js';
import bcrypt from 'bcrypt';

// 로그인
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'email_and_password_required' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
	    console.log("❌ 사용자 정보 없음: 이메일이 DB에 존재하지 않음");
            return res.status(401).json({ message: 'invalid_credentials' });
        }

        const isPasswordValid = await verifyPassword(password, user.password);

	if (!isPasswordValid) {
            console.log("❌ 비밀번호 불일치로 로그인 실패");
            return res.status(401).json({ message: 'invalid_credentials' });
        }
	
        req.session.user = {
            user_id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profile_image_path: user.profile_image_path,
        };

        req.session.save(err => {
            if (err) {
                console.error('세션 저장 오류:', err);
                return res.status(500).json({ message: 'session_save_error' });
            }
            res.json({ status: 200, message: 'login_success' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'internal_server_error' });
    }
};

// 로그인 상태 확인
export const getAuthStatus = (req, res) => {
    if (!req.session.user) { // 세션이 없으면 인증 실패
        return res.status(401).json({ message: "user_not_authenticated" });
    }
    res.status(200).json({ 
        message: 'authenticated',
        user: req.session.user // 클라이언트가 사용할 사용자 정보 반환
    });
};

// 유저 정보 조회
export const getUserById = async (req, res) => {
    const { user_id } = req.params;

    if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ message: "invalid_user_id" });
    }

    try {
        const user = await findUserByEmail(user_id); // 또는 새로운 함수로 DB 조회 구현
        if (!user) {
            return res.status(404).json({ message: "user_not_found" });
        }

        res.status(200).json({
            message: "get_user_success",
            data: {
                user_id: user.user_id,
                email: user.email,
                nickname: user.nickname,
                profile_image_path: user.profile_image_path,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "internal_server_error" });
    }
};

// 회원 가입
export const register = async (req, res) => {
    const { email, password, nickname } = req.body;
    const profile_image_path = req.file ? `/public/image/profile/${req.file.filename}` : null;

    if (!email || !password || !nickname) {
        return res.status(400).json({ message: 'missing_required_fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await saveUser({ email, password: hashedPassword, nickname, profile_image_path });

        res.status(201).json({
            message: 'register_success',
            data: { userId },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'internal_server_error' });
    }
};

// 이메일 중복 체크
export const checkEmailExists = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "required_email" });
    }

    try {
        const userResult = await findUserByEmail(email);
        const user = userResult && userResult[0]; // 배열 처리 추가

        if (user) {
            return res.status(409).json({ message: "already_exist_email" });
        }

        return res.status(200).json({ message: "available_email" });
    } catch (error) {
        console.error(`이메일 중복 체크 오류: ${error}`);
        return res.status(500).json({ message: "internal_server_error" });
    }
};

// 닉네임 중복 체크 (회원가입)
export const checkNicknameForSignup = async (req, res) => {
    const { nickname } = req.query;

    if (!nickname) {
        return res.status(400).json({ status: 400, message: "required_nickname", data: null });
    }

    try {
        const userResult = await findUserByNickname(nickname);
        const user = userResult && userResult[0]; // 배열 처리 추가

        if (user) {
            return res.status(409).json({ status: 409, message: "already_exist_nickname", data: null });
        }

        return res.status(200).json({ status: 200, message: "available_nickname", data: null });
    } catch (error) {
        console.error(`닉네임 중복 체크 오류: ${error}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 로그아웃
export const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'internal_server_error' })
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'logout_success' });
    });
}

// 회원 정보 수정
export const updateUser = async (req, res) => {
    const { user_id } = req.params;
    const { nickname } = req.body;
    const profile_image_path = req.file ? `/public/image/profile/${req.file.filename}` : null;

    if (!nickname || nickname.length > 10) {
        return res.status(400).json({ message: 'invalid_nickname' });
    }

    try {
        await updateUserModel(user_id, { nickname, profile_image_path });
        req.session.user.nickname = nickname;
        if (profile_image_path) req.session.user.profile_image_path = profile_image_path;

        res.status(200).json({
            message: 'update_profile_success',
            data: { user_id, profile_image_path },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'internal_server_error' });
    }
};

// 닉네임 중복 체크 (회원정보 수정)
export const checkNicknameForUpdate = async (req, res) => {
    const { nickname } = req.query;
    const user_id = req.user ? req.user.user_id : null;

    if (!nickname) {
        return res.status(400).json({ status: 400, message: "required_nickname", data: null });
    }

    try {
        const userResult = await findUserByNickname(nickname);
        const user = userResult && userResult[0]; // 배열 처리 추가

        if (user && user.user_id !== user_id) { // 닉네임이 존재하고, 본인의 닉네임이 아닌 경우
            return res.status(409).json({ status: 409, message: "already_exist_nickname", data: null });
        }

        return res.status(200).json({ status: 200, message: "available_nickname", data: null });
    } catch (error) {
        console.error(`닉네임 중복 체크 오류: ${error}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 회원 정보 삭제
export const deleteUser = async (req, res) => {
    const { user_id } = req.params;

    try {
        await deleteUserModel(user_id);

        req.session.destroy(err => {
            if (err) {
                console.error('세션 삭제 오류:', err);
                return res.status(500).json({ message: 'internal_server_error' });
            }
            res.clearCookie('connect.sid'); // 세션 쿠키 삭제
            res.status(200).json({ message: 'delete_user_success' });
        });
    } catch (error) {
        console.error(`회원 삭제 오류: ${error}`);
        res.status(500).json({ message: 'internal_server_error' });
    }
};

// 비밀번호 변경
export const changePassword = async (req, res) => {
    const { user_id } = req.params;
    const { password, confirmPassword } = req.body;

    if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ message: "invalid_user_id" });
    }
    if (!password || !confirmPassword || password !== confirmPassword) {
        return res.status(400).json({ message: "passwords_do_not_match_or_empty" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await updateUserModel(user_id, { password: hashedPassword });

        res.status(200).json({ message: "password_change_success" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "internal_server_error" });
    }
};
