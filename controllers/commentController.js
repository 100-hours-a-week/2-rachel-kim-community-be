/* commentController.js */
const { getCommentsByPostId, addComment, updateComment, deleteComment } = require('../models/commentModel');

// 댓글 목록 조회
const getPostComments = (req, res) => {
    const { post_id } = req.params;

    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try {
        const comments = getCommentsByPostId(post_id); // 모델 호출
        return res.status(200).json({ status: 200, message: "get_comments_success", data: comments });
    } catch (error) {
        console.error("댓글 조회 오류:", error.message);

        if (error.message === "댓글이 없습니다.") {
            return res.status(404).json({ status: 404, message: "not_a_single_comment", data: null });
        }

        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 댓글 등록 
const createComment = (req, res) => {
    const { post_id } = req.params;
    const { commentContent } = req.body;  
    const { id: userId, nickname, profile_image_path } = req.user;

    console.log('createComment  호출됨:', { post_id, commentContent, userId, nickname, profile_image_path });

    if (!post_id || !commentContent) {
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        const newComment = addComment(post_id, commentContent, userId, nickname, profile_image_path);
        console.log('생성된 댓글:', newComment);

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
    const { id: userId } = req.user; // 현재 로그인한 사용자 ID

    console.log('editComment 호출:', { post_id, comment_id, commentContent, userId });

    // 요청 데이터 검증
    if (!post_id || !comment_id || !commentContent || !userId) {
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        // 모델 호출
        const updatedComment = updateComment(post_id, comment_id, commentContent, userId);
        return res.status(200).json({ status: 200, message: "update_comment_success", data: updatedComment });
    } catch (error) {
        console.error("댓글 수정 오류:", error.message);

        // 모델에서 던진 에러 메시지에 따라 상태 코드 매핑
        if (error.message === "댓글을 찾을 수 없습니다.") {
            return res.status(404).json({ status: 404, message: "not_a_single_comment", data: null });
        }
        if (error.message === "권한이 없습니다.") {
            return res.status(403).json({ status: 403, message: "required_permission", data: null });
        }
        if (error.message === "댓글이 해당 게시글에 속하지 않습니다.") {
            return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
        }

        // 기타 에러는 500 처리
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 댓글 삭제
const removeComment = (req, res) => {
    const { post_id, comment_id } = req.params;   
    const { id: userId } = req.user; // JWT에서 추출된 id

    if (!post_id || !comment_id || !userId) {
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        // 댓글 가져오기
        const postComments = getCommentsByPostId(post_id); // post_id에 해당하는 댓글들 가져오기
        const comment = postComments.find(c => c.comment_id === Number(comment_id));

        // 댓글이 존재하지 않을 경우
        if (!comment) {
            return res.status(404).json({ status: 404, message: "not_a_single_comment", data: null });
        }

        // 권한 확인 (작성자가 아닌 경우)
        if (comment.user_id !== userId) {
            return res.status(403).json({ status: 403, message: "required_permission", data: null });
        }

        deleteComment(post_id, comment_id, userId);
        return res.status(200).json({ status: 200, message: "delete_comment_success", data: null });
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};


module.exports = { getPostComments, createComment, editComment, removeComment };