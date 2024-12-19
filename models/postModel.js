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
    console.log("삭제 요청 post_id:", post_id);
    
    const index = posts.findIndex(post => post.post_id === Number(post_id));
    console.log("찾은 인덱스:", index);

    if (index !== -1) {
        posts.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2), 'utf-8'); // JSON 파일 업데이트
        console.log("게시글 삭제 완료");
    } else {
        throw new Error("게시글을 찾을 수 없습니다.");
    }
};

module.exports = { getPosts,  getPostById, deletePost};