/* userModel.js */
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const dataPath = path.join(__dirname, '../data/users.json');

// 사용자 목록 조회
export const getUsers = () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};

// 사용자 조회 (이메일)
export const findUserByEmail = (email) => {
    const users = getUsers();
    return users.find(user => user.email === email);
};

// 비밀번호 검증
export const verifyPassword = (plainPassword, hashedPassword) =>  bcrypt.compareSync(plainPassword, hashedPassword); // Test0910@

// 사용자 데이터 저장
export const saveUsers = (users) => {
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};

// 사용자 조회 (닉네임)
export const findUserByNickname = (nickname) => {
    const users = getUsers();
    return users.find(user => user.nickname === nickname);
};

// 사용자 등록
export const saveUser = (userData) => {
    const users = getUsers();
    const newUser = {
        user_id: users.length + 1,
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
        profile_image_path: userData.profileImagePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    };
    users.push(newUser);
    saveUsers(users);
    return newUser.user_id;
};