/* postController.js */
import pool from '../db.js';
import { getPosts, 
         getPostById, 
         deletePost, 
         createPost,
         updatePost,
} from '../models/postModel.js';

// 게시글 목록 조회
export const getPostsList = async (req, res) => {
    try {
        const posts = await getPosts();
        if (!posts || posts.length === 0) {
            return res.status(404).json({ status: 404, message: `not_a_single_post`, data: null });
        }
        res.status(200).json({ status: 200, message: "get_posts_success", data: posts });
    } catch (error) {
        console.error(`게시글 목록 조회 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 게시글 상세 조회
export const getPostDetail = async (req, res) => {
    const { post_id } = req.params;

    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try {
        const post = await getPostById(post_id);
        if (!post) {
            return res.status(404).json({ status: 404, message: "post_not_found", data: null });
        }

        res.status(200).json({ status: 200, message: "get_post_success", data: post });
    } catch (error) {
        console.error(`게시글 상세 조회 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 게시글 추가
export const createPostController = async (req, res) => {
    const { postTitle, postContent } = req.body;
    const { file } = req;
    const { user_id } = req.user;

    if (!postTitle || !postContent) {
        return res.status(400).json({ status: 400, message: "invalid_request", data: null });
    }

    const newPost = {
        user_id,
        post_title: postTitle,
        post_content: postContent,
        post_image_path: file ? `/public/image/posts/${file.filename}` : null,
    };

    try {
        const postId = await createPost(newPost);
        res.status(201).json({ status: 201, message: "write_post_success", data: { post_id: postId } });
    } catch (error) {
        console.error(`게시글 추가 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 게시글 삭제
export const removePost = async (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user;

    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try {
        const post = await getPostById(post_id);
        if (!post) {
            return res.status(404).json({ status: 404, message: "post_not_found", data: null });
        }
        if (post.user_id !== user_id) {
            return res.status(403).json({ status: 403, message: "required_permission", data: null });
        }
        await deletePost(post_id);
        res.status(200).json({ status: 200, message: "delete_post_success", data: null });
    } catch (error) {
        console.error(`게시글 삭제 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 게시글 수정
export const updatePostController = async (req, res) => {
    const { post_id } = req.params;
    const { postTitle, postContent, existingImagePath } = req.body;
    const { file } = req;
    const { user_id } = req.user;

    if (!post_id || !postTitle || !postContent) {
        return res.status(400).json({ status: 400, message: "invalid_request", data: null });
    }

    try {
        const post = await getPostById(post_id);
        if (!post) {
            return res.status(404).json({ status: 404, message: "post_not_found", data: null });
        }
        if (post.user_id !== user_id) {
            return res.status(403).json({ status: 403, message: "required_permission", data: null });
        }

        const updatedPost = {
            post_title: postTitle,
            post_content: postContent,
            post_image_path: file ? `/public/image/posts/${file.filename}` : existingImagePath,
        };

        await updatePost(post_id, updatedPost);
        res.status(200).json({ status: 200, message: "update_post_success", data: { post_id } });
    } catch (error) {
        console.error(`게시글 수정 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 좋아요 상태 조회
export const checkLikeStatus = async (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user;

    try {
        const post = await getPostById(post_id);
        if (!post) {
            return res.status(404).send({ message: "Post not found" });
        }

        const query = `
            SELECT COUNT(*) AS liked 
            FROM PostLikes 
            WHERE post_id = ? AND user_id = ?
        `;
        const [rows] = await pool.query(query, [post_id, user_id]);
        const liked = rows[0].liked > 0;

        res.send({ liked, likeCount: post.likes });
    } catch (error) {
        console.error(`좋아요 상태 확인 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error" });
    }
};

// 좋아요 토글 (트랜잭션)
export const toggleLike = async (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user;

    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 좋아요 상태 확인
            const checkQuery = `
                SELECT COUNT(*) AS liked 
                FROM PostLikes 
                WHERE post_id = ? AND user_id = ?
            `;
            const [checkRows] = await connection.query(checkQuery, [post_id, user_id]);
            const alreadyLiked = checkRows[0].liked > 0;

            if (alreadyLiked) {
                // 좋아요 취소
                const unlikeQuery = `DELETE FROM PostLikes WHERE post_id = ? AND user_id = ?`;
                await connection.query(unlikeQuery, [post_id, user_id]);
            } else {
                // 좋아요 추가
                const likeQuery = `INSERT INTO PostLikes (post_id, user_id) VALUES (?, ?)`;
                await connection.query(likeQuery, [post_id, user_id]);
            }

            await connection.commit();

            // 좋아요 수 반환
            const likeCountQuery = `
                SELECT COUNT(*) AS likeCount 
                FROM PostLikes 
                WHERE post_id = ?
            `;
            const [likeCountRows] = await connection.query(likeCountQuery, [post_id]);
            const likeCount = likeCountRows[0].likeCount;

            res.status(200).json({ likeCount });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(`좋아요 토글 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error" });
    }
};

// 조회수 업데이트 (트랜잭션)
export const updatePostView = async (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user;

    try {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 조회 기록 확인
            const checkQuery = `
                SELECT COUNT(*) AS viewed 
                FROM PostViews 
                WHERE post_id = ? AND user_id = ?
            `;
            const [checkRows] = await connection.query(checkQuery, [post_id, user_id]);
            const alreadyViewed = checkRows[0].viewed > 0;

            if (!alreadyViewed) {
                // 조회 기록 추가
                const viewQuery = `INSERT INTO PostViews (post_id, user_id) VALUES (?, ?)`;
                await connection.query(viewQuery, [post_id, user_id]);
            }

            await connection.commit();

            // 조회수 반환
            const viewCountQuery = `
                SELECT COUNT(*) AS viewCount 
                FROM PostViews 
                WHERE post_id = ?
            `;
            const [viewCountRows] = await connection.query(viewCountQuery, [post_id]);
            const viewCount = viewCountRows[0].viewCount;

            res.status(200).json({ viewCount });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error(`조회수 업데이트 오류: ${error}`);
        res.status(500).json({ status: 500, message: "internal_server_error" });
    }
};