/* postController.js */
const { getPosts, getPostById, getCommentsByPostId, addComment, updateComment, deleteComment, deletePost } = require('../models/postModel');

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
        //post.profile_image_path = post.profile_image_path || "/public/images/profile/default-profile.jpeg"; // 기본 프로필 이미지

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

        post.profile_image_path = post.profile_image_path || "/public/images/profile/default-profile.jpeg"; // 기본 프로필 이미지
        
        return res.status(200).json({ status: 200, message: "get_post_success", data: post });
    } catch (error) {
        console.error("게시글 조회 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
}   

// 댓글 목록 조회
const getPostComments = (req, res) => {
    const { post_id } = req.params;
    
    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try{
        const comments = getCommentsByPostId(post_id);
        if (!comments || comments.length === 0) {
            return res.status(404).json({ status: 404, message: "not_a_single_comment", data: null });
        }

        const response = comments.map(comment => ({
            comment_id: comment.comment_id,
            comment_content: comment.comment_content,
            user_id: comment.user_id,
            comment_author_profile_image_path: comment.author_photo || "/public/images/profile/default-profile.webp", // 기본 댓글 작성자 프로필
            comment_author_name: comment.author_name,
            created_at: comment.created_at
        }));

        return res.status(200).json({ status: 200, message: "get_comments_success", data: response });
    } catch (error) {
        console.error("댓글 조회 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
    
}

// 댓글 등록 
const createComment = (req, res) => {
    const { post_id } = req.params;
    const { commentContent } = req.body;  
    const userId = req.user.id;

    if (!post_id || !commentContent || !userId) {
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        const newComment = addComment(post_id, commentContent, userId);
        return res.status(201).json({ status: 201, message: "write_comment_success", data: newComment });
    } catch (error) {
        console.error("댓글 등록 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 댓글 수정
const editComment = (req, res) => {
    const { post_id, comment_id } = req.params;
    const { commentContent } = req.body;   
    const userId = req.user.id;

    if (!post_id || !comment_id || !commentContent || !userId) {
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        const updatedComment = updateComment(post_id, comment_id, commentContent, userId);
        return res.status(200).json({ status: 200, message: "update_comment_success", data: updatedComment });
    } catch (error) {
        console.error("댓글 수정 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 댓글 삭제
const removeComment = (req, res) => {
    const { post_id, comment_id } = req.params;    // parma에 user_id 없을텐데?
    const userId = req.user.id; // JWT에서 추출된 user_id

    if (!post_id || !comment_id || !userId) {
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        deleteComment(post_id, comment_id, userId);
        return res.status(200).json({ status: 200, message: "delete_comment_success", data: null });
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 게시글 삭제
const removePost = (req, res) => {
    const { post_id } = req.params;

    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try {
        deletePost(post_id);
        return res.status(200).json({ status: 200, message: "delete_post_success", data: null });
    } catch (error) {
        console.error("게시글 삭제 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};


module.exports = { getPostsList, getPostDetail, getPostComments, createComment, editComment, removeComment, removePost };