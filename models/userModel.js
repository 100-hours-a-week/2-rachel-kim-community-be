/* userModel.js */
import pool from '../db.js';
import bcrypt from 'bcrypt';

// 사용자 조회 (이메일) 
export const findUserByEmail = async (email) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM User WHERE email = ? AND deleted_at IS NULL', [email]);
        return rows[0];
    } finally {
        if (conn) conn.release();
    }
};

// 사용자 조회 (닉네임)
export const findUserByNickname = async (nickname) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM User WHERE nickname = ? AND deleted_at IS NULL', [nickname]);
        return rows[0];
    } finally {
        if (conn) conn.release();
    }
};

// 비밀번호 검증
export const verifyPassword = async (plainPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('비밀번호 검증 오류:', error);
        throw error;
    }
};

// 사용자 등록
export const saveUser = async (userData) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO User (email, password, nickname, profile_image_path) VALUES (?, ?, ?, ?)',
            [userData.email, userData.password, userData.nickname, userData.profile_image_path]
        );
        return result.insertId;
    } finally {
        if (conn) conn.release();
    }
};

// 사용자 정보 업데이트
export const updateUser = async (userId, updates) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const fields = [];
        const values = [];
        if (updates.nickname) {
            fields.push('nickname = ?');
            values.push(updates.nickname);
        }
        if (updates.profile_image_path) {
            fields.push('profile_image_path = ?');
            values.push(updates.profile_image_path);
        }
        if (updates.password) { 
            fields.push('password = ?');
            values.push(updates.password);
        }

        if (fields.length > 0) {
            const query = `UPDATE User SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = ?`;
            values.push(userId);
            await conn.query(query, values);
        }
    } finally {
        if (conn) conn.release();
    }
};

// 사용자 삭제 (하드 삭제)
export const deleteUser = async (userId) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('DELETE FROM User WHERE user_id = ?', [userId]);
    } finally {
        if (conn) conn.release();
    }
};