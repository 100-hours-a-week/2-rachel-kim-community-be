/* commentModel.js */
import pool from '../db.js';
import { updateCommentCount } from './postModel.js';

// 댓글 목록 조회 (JOIN)
export const getCommentsByPostId = async (post_id) => {
    const query = `
        SELECT c.comment_id, c.post_id, c.comment_content, c.user_id, c.created_at, c.updated_at,
               u.nickname, u.profile_image_path
        FROM Comment c
        JOIN User u ON c.user_id = u.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    `;
    const [rows] = await pool.query(query, [post_id]);
    if (rows.length === 0) {
        throw new Error("댓글이 없습니다.");
    }
    return rows;
};

// 댓글 등록 (트랜잭션)
export const addComment = async (postId, content, userId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 댓글 추가
        const insertCommentQuery = `
            INSERT INTO Comment (post_id, comment_content, user_id, created_at, updated_at)
            VALUES (?, ?, ?, NOW(), NOW())
        `;
        const [result] = await connection.query(insertCommentQuery, [postId, content, userId]);

        // 댓글 수 업데이트
        const updateCommentCountQuery = `
            UPDATE Post
            SET comment_count = comment_count + 1
            WHERE post_id = ?
        `;
        await connection.query(updateCommentCountQuery, [postId]);

        await connection.commit();

        return {
            comment_id: result.insertId,
            post_id: postId,
            comment_content: content,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// 댓글 수정
export const updateComment = async (post_id, comment_id, content, user_id) => {
    const findQuery = `
        SELECT * FROM Comment
        WHERE comment_id = ? AND post_id = ? AND user_id = ?
    `;
    const [rows] = await pool.query(findQuery, [comment_id, post_id, user_id]);
    if (rows.length === 0) {
        throw new Error("댓글을 찾을 수 없습니다.");
    }

    const updateQuery = `
        UPDATE Comment
        SET comment_content = ?, updated_at = NOW()
        WHERE comment_id = ? AND post_id = ? AND user_id = ?
    `;
    await pool.query(updateQuery, [content, comment_id, post_id, user_id]);

    return {
        ...rows[0],
        comment_content: content,
        updated_at: new Date().toISOString(),
    };
};

// 댓글 삭제 (트랜잭션)
export const deleteComment = async (post_id, comment_id, user_id) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 댓글 삭제
        const deleteCommentQuery = `
            DELETE FROM Comment
            WHERE comment_id = ? AND post_id = ? AND user_id = ?
        `;
        const [result] = await connection.query(deleteCommentQuery, [comment_id, post_id, user_id]);
        if (result.affectedRows === 0) {
            throw new Error("댓글을 찾을 수 없습니다.");
        }

        // 댓글 수 업데이트
        const updateCommentCountQuery = `
            UPDATE Post
            SET comment_count = comment_count - 1
            WHERE post_id = ?
        `;
        await connection.query(updateCommentCountQuery, [post_id]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};
