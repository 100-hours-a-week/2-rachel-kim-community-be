/* userController.js */
import { findUserByEmail, verifyPassword, findUserByNickname, saveUser, getUsers, saveUsers } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { updatePostsByUserId } from '../models/postModel.js';
import { updateCommentsByUserId } from '../models/commentModel.js';

// 로그인
export const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) { // 필수 입력값 검증
        return res.status(400).json({ message: 'email_and_password_required' });
    }

    try {
        const user = findUserByEmail(email); // 사용자 조회
        if (!user || !verifyPassword(password, user.password)) {
            return res.status(401).json({ message: 'invalid_credentials' });
        }
    
        req.session.user = { // 사용자 세션 생성 및 사용자 정보 저장
            user_id: user.user_id,
            email: user.email,
            nickname: user.nickname,
            profile_image_path: user.profile_image_path // 프로필 이미지 추가
        };
        
        req.session.save(err => { // 세션 저장 후 응답
            if (err) {
                console.error("세션 저장 오류:", err);
                return res.status(500).json({ message: "session_save_error" });
            }
            res.json({ status: 200, message: "login_success" });
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
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

// 이메일 중복 체크
export const checkEmailExists = (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ status: 400, message: "required_email", data: null });
    }

    try {
        const user = findUserByEmail(email);
        if (user) {
            return res.status(409).json({ status: 409, message: "already_exist_email", data: null });
        }

        return res.status(200).json({ status: 200, message: "available_email", data: null });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 닉네임 중복 체크 (회원가입)
export const checkNicknameForSignup = (req, res) => {
    const { nickname } = req.query;

    if (!nickname) {
        return res.status(400).json({ status: 400, message: "required_nickname", data: null });
    }

    try {
        const user = findUserByNickname(nickname);
        if (user) {
            return res.status(409).json({ status: 409, message: "already_exist_nickname", data: null });
        }

        return res.status(200).json({ status: 200, message: "available_nickname", data: null });
    } catch (error) {
        console.error(`닉네임 중복 체크 오류: ${error}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 닉네임 중복 체크 (회원정보 수정)
export const checkNicknameForUpdate = (req, res) => {
    const { nickname } = req.query;
    const user_id = req.user ? req.user.user_id : null;

    if (!nickname) {
        return res.status(400).json({ status: 400, message: "required_nickname", data: null });
    }

    try {
        const user = findUserByNickname(nickname);
        if (user && user.user_id !== user_id) { // 닉네임이 존재하고, 본인의 닉네임이 아닌 경우
            return res.status(409).json({ status: 409, message: "already_exist_nickname", data: null });
        }

        return res.status(200).json({ status: 200, message: "available_nickname", data: null });
    } catch (error) {
        console.error(`닉네임 중복 체크 오류: ${error}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 회원 가입 응답
export const register = async (req, res) => {
    const { email, password, nickname } = req.body;
    const profile_image_path = req.file ? `/public/image/profile/${req.file.filename}` : null;

    if (!email || !password || !nickname) { // 필수 입력값 검증
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
        const userId = saveUser({ email, password: hashedPassword, nickname, profile_image_path }); // 사용자 저장
        res.status(201).json({
            status: 201,
            message: "register_success",
            data: { userId }, // 임의로 userId를 이미지 ID로 설정
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 유저 정보 조회
export const getUserById = (req, res) => {
    const { user_id } = req.params; 
    const users = getUsers();
   
    if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ status: 400, message: "invalid_user_id", data: null });
    }

    const user = users.find(user => user.user_id === Number(user_id));
    if (!user) {
        return res.status(404).json({ status: 404, message: "not_found_user", data: null });
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
export const updateUser = (req, res) => {
    const { user_id } = req.params;
    const { user_id: authenticatedUserId } = req.user;
    const { nickname } = req.body;
    const profile_image_path = req.file ? `/public/image/profile/${req.file.filename}` : users[userIndex].profile_image_path;

    if (!user_id || !nickname) {
        return res.status(400).json({ status: 400, message: "invalid_request", data: null });
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

        users[userIndex] = { // 사용자 정보 업데이트
            ...users[userIndex],
            nickname,
            profile_image_path: profile_image_path || users[userIndex].profile_image_path,
            updated_at: new Date().toISOString(),
        };

        saveUsers(users);

        req.session.user.nickname = nickname; // 세션 데이터 갱신
        req.session.user.profile_image_path = profile_image_path;

        return res.status(200).json({ 
            status: 200, 
            message: "update_profile_success", 
            data: { 
                user_id: Number(user_id), 
                profile_image_path: users[userIndex].profile_image_path // 변경된 경로 반환
            } 
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 회원 정보 삭제
export const deleteUser = (req, res) => {
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
        
        users.splice(userIndex, 1); // 배열에서 유저를 제거 (하드 삭제)
        saveUsers(users);
        
        return res.status(200).json({ status: 200, message: "delete_user_data_success", data: null });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 비밀번호 변경
export const changePassword = (req, res) => {
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

    bcrypt.hash(password, 10) // 비밀번호 해시화
        .then(hashedPassword => {
            users[userIndex].password = hashedPassword;
            users[userIndex].updated_at = new Date().toISOString();
            saveUsers(users);

            res.status(201).json({ status: 201, message: "change_user_password_success", data: null });
        })
        .catch(error => {
            console.error(`비밀번호 해싱 실패: ${error.message}`);
            res.status(500).json({ status: 500, message: "internal_server_error", data: null });
        });
};