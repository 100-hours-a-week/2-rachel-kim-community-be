/* postModel.js */
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/posts.json');
const posts = require('../data/posts.json');
const comments = [];

// 게시글 목록 조회
const getPosts = () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data).map(post => ({
        ...post,
        profile_image_path: post.profile_image_path || "/public/images/profile/default-profile.webp", // 기본 프로필 이미지
    }));
};

// 게시글 상세 조회
const getPostById = (post_id) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const post = posts.find(post => post.post_id === Number(post_id));
    if (post) {
        post.profile_image_path = post.profile_image_path || "/images/profile/default-profile.webp";
        return post;
    }
    return null;
};

// 댓글 목록 조회
const getCommentsByPostId = (post_id) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const post = posts.find(p => p.post_id === Number(post_id));
    if (post && post.comments) {
        return post.comments.map(comment => ({
            ...comment,
            author_photo: comment.author_photo || "/images/profile/default-profile.jpeg"
        }));
    }
    return [];
};

// 댓글 등록
const addComment = (postId, content, userId) => {
    const newComment = {
        comment_id: comments.length + 1,
        comment_content: content,
        post_id: Number(postId),
        user_id: Number(userId),
        nickname: `사용자${userId}`,
        created_at: new Date().toISOString()
    };
    comments.push(newComment);
    return newComment;
}; //api에서는 댓글 내용만 받아올텐데 api 수정이 나은지 

// 댓글 수정
const updateComment = (postId, commentId, content, userId) => {
    const comment = comments.find(comment => comment.comment_id === Number(commentId) && comment.post_id === Number(postId) && comment.user_id === Number(userId));
    if (comment) {
        comment.comment_content = content;
        comment.updated_at = new Date().toISOString();
        return comment;
    }
    throw new Error("댓글을 찾을 수 없거나 권한이 없습니다.");
};

// 댓글 삭제
const deleteComment = (postId, commentId, userId) => {
    const index = comments.findIndex(comment => comment.comment_id === Number(commentId) && comment.post_id === Number(postId) && comment.user_id === Number(userId));
    if (index !== -1) comments.splice(index, 1);
    else throw new Error("댓글을 찾을 수 없거나 권한이 없습니다.");
};

// 게시글 삭제
const deletePost = (postId) => {
    const index = posts.findIndex(post => post.post_id === Number(postId));
    if (index !== -1) posts.splice(index, 1);
    else throw new Error("게시글을 찾을 수 없습니다.");
};

module.exports = { getPosts,  getPostById, getCommentsByPostId, addComment, updateComment, deleteComment, deletePost};