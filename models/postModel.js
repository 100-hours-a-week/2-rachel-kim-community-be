/* postModel.js */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/posts.json');

// 게시글 목록 조회
export const getPosts = () => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 게시글 데이터 읽기
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8')); // 사용자 데이터 읽기

    return posts.map(post => {
        const user = users.find(user => user.user_id === post.user_id);
        return {
            ...post,
            nickname: user ? user.nickname : post.nickname,
            profile_image_path: user ? user.profile_image_path : "/public/image/profile/default-profile.jpeg",
        };
    });
};

// 게시글 상세 조회
export const getPostById = (post_id) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8')); // 사용자 데이터 읽기
    const post = posts.find(post => post.post_id === Number(post_id));
    
    if (post) {
        const user = users.find(user => user.user_id === post.user_id);
        return {
            ...post,
            nickname: user ? user.nickname : post.nickname,
            profile_image_path: user ? user.profile_image_path : "/public/image/profile/default-profile.jpeg",
        };
    }
    return null;
};

// 게시글 삭제
export const deletePost = (post_id) => {    
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const index = posts.findIndex(post => post.post_id === Number(post_id));

    if (index !== -1) {
        posts.splice(index, 1);
        fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2), 'utf-8'); // JSON 파일 업데이트
    } else {
        throw new Error("게시글을 찾을 수 없습니다.");
    }
};

// 게시글 업데이트
export const updatePostsByUserId = (user_id, updatedData) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const updatedPosts = posts.map(post => ({
        ...post,
        nickname: updatedData.nickname || post.nickname,
        profile_image_path: updatedData.profile_image_path || post.profile_image_path,
    }));
    fs.writeFileSync(dataPath, JSON.stringify(updatedPosts, null, 2), 'utf-8');
};

// 게시글 저장
export const savePost = (updatedPost) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const postIndex = posts.findIndex(post => post.post_id === updatedPost.post_id);
   
    if (postIndex !== -1) {
        posts[postIndex] = updatedPost;
        fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2), 'utf-8');
    }
};

// 댓글 수 관리
export const updateCommentCount = (postId, increment = true) => {
    const posts = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const postIndex = posts.findIndex(post => post.post_id === Number(postId));

    if (postIndex !== -1) {
        posts[postIndex].comment_count += increment ? 1 : -1;
        posts[postIndex].comment_count = Math.max(0, posts[postIndex].comment_count); // 음수 방지
        fs.writeFileSync(dataPath, JSON.stringify(posts, null, 2), 'utf-8');
    } else {
        throw new Error(`Post with ID ${postId} not found`);
    }
};