/* postModel.js */
import pool from '../db.js';

// 게시글 목록 조회 (JOIN)
export const getPosts = async () => {
    const query = `
        SELECT 
            p.post_id, p.post_title, p.post_content, p.post_image_path,
            COUNT(DISTINCT pl.like_id) AS likes,
            COUNT(DISTINCT pv.view_id) AS views,
            p.comment_count, p.created_at, p.updated_at,
            p.user_id, u.nickname, u.profile_image_path
        FROM Post p
        JOIN User u ON p.user_id = u.user_id
        LEFT JOIN PostLikes pl ON p.post_id = pl.post_id
        LEFT JOIN PostViews pv ON p.post_id = pv.post_id
        GROUP BY p.post_id
        ORDER BY p.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
};

// 게시글 상세 조회 (JOIN)
export const getPostById = async (post_id) => {
    const query = `
        SELECT 
            p.post_id, p.post_title, p.post_content, p.post_image_path,
            COUNT(DISTINCT pl.like_id) AS likes,
            COUNT(DISTINCT pv.view_id) AS views,
            p.comment_count, p.created_at, p.updated_at,
            p.user_id, u.nickname, u.profile_image_path
        FROM Post p
        JOIN User u ON p.user_id = u.user_id
        LEFT JOIN PostLikes pl ON p.post_id = pl.post_id
        LEFT JOIN PostViews pv ON p.post_id = pv.post_id
        WHERE p.post_id = ?
        GROUP BY p.post_id
    `;
    const [rows] = await pool.query(query, [post_id]);
    return rows[0];
};

// 게시글 삭제
export const deletePost = async (post_id) => {
    const query = `DELETE FROM Post WHERE post_id = ?`;
    await pool.query(query, [post_id]);
};

// 게시글 저장 (INSERT)
export const createPost = async (newPost) => {
    const query = `
        INSERT INTO Post (user_id, post_title, post_content, post_image_path, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    const [result] = await pool.query(query, [
        newPost.user_id,
        newPost.post_title,
        newPost.post_content,
        newPost.post_image_path,
    ]);
    return result.insertId;
};

// 게시글 수정
export const updatePost = async (post_id, updatedPost) => {
    const query = `
        UPDATE Post
        SET post_title = ?, post_content = ?, post_image_path = ?, updated_at = NOW()
        WHERE post_id = ?
    `;
    await pool.query(query, [
        updatedPost.post_title,
        updatedPost.post_content,
        updatedPost.post_image_path,
        post_id,
    ]);
};

///// 댓글 수 업데이트
export const updateCommentCount = async (post_id, increment) => {
    const query = `
        UPDATE Post
        SET comment_count = comment_count + ?
        WHERE post_id = ?
    `;
    await pool.query(query, [increment ? 1 : -1, post_id]);
};