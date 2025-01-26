/* commentController.js */
import { getCommentsByPostId, addComment, updateComment, deleteComment } from '../models/commentModel.js';

// 댓글 목록 조회
export const getPostComments = async (req, res) => {
    const { post_id } = req.params;

    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try {
        const comments = await getCommentsByPostId(post_id);
        return res.status(200).json({ status: 200, message: "get_comments_success", data: comments });
    } catch (error) {
        if (error.message === "댓글이 없습니다.") {
            return res.status(404).json({ status: 404, message: "not_a_single_comment", data: null });
        }
        console.error(`댓글 조회 오류: ${error.message}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 댓글 등록 
export const createComment = async (req, res) => {
    const { post_id } = req.params;
    const { commentContent } = req.body;  
    const { user_id, nickname, profile_image_path } = req.user;

    if (!req.user) {
        console.error('로그인된 사용자 정보가 없습니다.');
        return res.status(401).json({ status: 401, message: 'user_not_authenticated' });
    }

    if (!post_id || !commentContent) {
        console.error('필수 데이터 누락:', { post_id, commentContent });
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        const newComment = await addComment(post_id, commentContent, user_id, nickname, profile_image_path);
        return res.status(201).json({ status: 201, message: "write_comment_success", data: newComment });
    } catch (error) {
        console.error(`댓글 등록 오류: ${error.message}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 댓글 수정
export const editComment = (req, res) => {
    const { post_id, comment_id } = req.params;
    const { commentContent } = req.body;
    const { user_id } = req.user; // 현재 로그인한 사용자 ID

    if (!post_id || !comment_id || !commentContent || !user_id) { // 요청 데이터 검증
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        const updatedComment = updateComment(post_id, comment_id, commentContent, user_id); // 모델 호출
        return res.status(200).json({ status: 200, message: "update_comment_success", data: updatedComment });
    } catch (error) {
        console.error(`댓글 수정 오류: ${error.message}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 댓글 삭제
export const removeComment = async (req, res) => {
    const { post_id, comment_id } = req.params;   
    const { user_id } = req.user; // JWT에서 추출된 id

    if (!post_id || !comment_id || !user_id) {
        return res.status(400).json({ status: 400, message: "missing_required_fields", data: null });
    }

    try {
        await deleteComment(post_id, comment_id, user_id);
        return res.status(200).json({ status: 200, message: "delete_comment_success", data: null });
    } catch (error) {
        console.error(`댓글 삭제 오류: ${error.message}`);
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};