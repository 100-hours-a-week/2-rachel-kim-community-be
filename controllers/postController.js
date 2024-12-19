/* postController.js */
const { getPosts, getPostById, deletePost } = require('../models/postModel');

// 게시글 목록 조회
const getPostsList = (req, res) => {
    try {
        // 데이터 가져오기
        const posts = getPosts();
        console.log('getPosts에서 반환된 데이터:', posts);

        // 게시글 데이터가 없는 경우
        if (!posts || posts.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "not_a_single_post",
                data: null
            });
        }

        // 성공 응답
        const response = {
            status: 200,
            message: "get_posts_success",
            data: posts.map(post => ({
                post_id: post.post_id,
                post_title: post.post_title,
                post_content: post.post_content,
                post_image_path: post.post_image_path, // api 확인
                file_id: post.file_id,
                user_id: post.user_id,   
                nickname: post.nickname,
                created_at: post.created_at,
                updated_at: post.updated_at,
                deleted_at: post.deleted_at,
                likes: post.likes,
                comment_count: post.comment_count,
                views: post.views,
                profile_image_path: post.profile_image_path
            }))
        };

        console.log('응답 데이터:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error("게시글 목록 조회 오류:", error);
        res.status(500).json({
            status: 500,
            message: "internal_server_error",
            data: null
        });
    }
};

// 게시글 상세 조회
const getPostDetail = (req, res) => {
    const { post_id } = req.params;

    if (!post_id) {
        return res.status(400).json({status: 400, message: "invalid_post_id", data: null})
    }

    try {
        const post = getPostById(post_id);
        if (!post) {
            return res.status(404).json({ status: 404, message: "post_not_found", data: null });
        }

        return res.status(200).json({ status: 200, message: "get_post_success", data: post });
    } catch (error) {
        console.error("게시글 조회 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
}   

// 게시글 삭제
const removePost = (req, res) => {
    const { post_id } = req.params;
    const { id } = req.user; 

    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try {
        const post = getPostById(post_id);
        if (!post) {
            return res.status(404).json({ status: 404, message: "not_a_single_post", data: null });
        }

        if (post.id !== id) {
            return res.status(403).json({ status: 403, message: "required_permission", data: null });
        }

        deletePost(post_id);
        return res.status(200).json({ status: 200, message: "delete_post_success", data: null });
    } catch (error) {
        console.error("게시글 삭제 오류:", error.message);
        return res.status(500).json({ status: 500, message: "Internal server error", data: null });
    }
};


module.exports = { getPostsList, getPostDetail, removePost };