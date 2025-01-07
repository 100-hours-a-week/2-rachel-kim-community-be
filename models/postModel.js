/* postModel.js */
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/posts.json');
const posts = require('../data/posts.json');

// 게시글 목록 조회
const getPosts = () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data).map(post => ({
        ...post,
        profile_image_path: post.profile_image_path || "/public/image/profile/default-profile.jpeg", // 기본 프로필 이미지
    }));
};

// 게시글 상세 조회
const getPostById = (post_id) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const post = posts.find(post => post.post_id === Number(post_id));
    if (post) {
        return {
            ...post,
            profile_image_path: post.profile_image_path || "/public/image/profile/default-profile.jpeg",
        };
    }
    return null;
};

// 게시글 삭제
const deletePost = (post_id) => {    
    const index = posts.findIndex(post => post.post_id === Number(post_id));

    if (index !== -1) {
        posts.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2), 'utf-8'); // JSON 파일 업데이트
    } else {
        throw new Error("게시글을 찾을 수 없습니다.");
    }
};

// 게시글 업데이트
const updatePostsByUserId = (user_id, updatedData) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const updatedPosts = posts.map(post => {
        if (post.user_id === user_id) {
            return {
                ...post,
                nickname: updatedData.nickname || post.nickname,
                profile_image_path: updatedData.profile_image_path || post.profile_image_path,
            };
        }
        return post;
    });
    fs.writeFileSync(dataPath, JSON.stringify(updatedPosts, null, 2), 'utf-8');
};

module.exports = { getPosts, getPostById, deletePost, updatePostsByUserId };