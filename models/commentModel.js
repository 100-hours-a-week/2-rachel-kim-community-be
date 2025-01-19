/* commentModel.js */
import fs from 'fs';
import path from 'path';
import { updateCommentCount } from './postModel.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/comments.json');
const postsPath = path.join(__dirname, '../data/posts.json');

const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

// 댓글 목록 조회
export const getCommentsByPostId = (post_id) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 댓글 데이터 읽기
    const filteredComments = comments.filter(comment => comment.post_id === Number(post_id));
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8')); // 사용자 데이터 읽기

    if (filteredComments.length === 0) {
        throw new Error("댓글이 없습니다."); // 404 에러
    }

    return filteredComments.map(comment => {
        const user = users.find(user => user.user_id === comment.user_id);
        return {
            ...comment,
            nickname: user ? user.nickname : comment.nickname,
            profile_image_path: user.profile_image_path,
        };
    });
};

// 댓글 등록
export const addComment = (postId, content, userId, userNickname, userProfileImage) => {    
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 파일에서 댓글 데이터 읽기
    const newComment = {
        comment_id: comments.length + 1,
        post_id: Number(postId),
        comment_content: content,
        user_id: userId,
        nickname: userNickname,
        created_at: new Date().toISOString(),
        profile_image_path: userProfileImage,
    };

    comments.push(newComment); // 댓글 추가
    fs.writeFileSync(dataPath, JSON.stringify(comments, null, 2), 'utf-8'); // 파일 저장

    updateCommentCount(postId, true); // 댓글 수 업데이트

    return newComment; 
};

// 댓글 수정
export const updateComment = (post_id, comment_id, content, user_id) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 최신 데이터 읽기

    const comment = comments.find(comment => comment.comment_id === Number(comment_id)); // 댓글 찾기

    if (!comment) {
        throw new Error("댓글을 찾을 수 없습니다."); // 404 에러
    }

    if (comment.post_id !== Number(post_id)) {
        throw new Error("댓글이 해당 게시글에 속하지 않습니다."); // 400 에러 (논리적 오류)
    }

    if (comment.user_id !== Number(user_id)) {
        throw new Error("권한이 없습니다."); // 403 에러
    }

    comment.comment_content = content; // 댓글 수정
    comment.updated_at = new Date().toISOString();

    fs.writeFileSync(dataPath, JSON.stringify(comments, null, 2), 'utf-8'); // 변경 사항 저장
    return comment;
};

// 댓글 삭제
export const deleteComment = (post_id, comment_id, user_id) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 최신 데이터 읽기
    const commentIndex = comments.findIndex(comment => // 댓글 인덱스 찾기
        comment.post_id === Number(post_id) &&
        comment.comment_id === Number(comment_id)
    );

    if (commentIndex === -1) {
        throw new Error("댓글을 찾을 수 없습니다."); // 404 에러
    }
    
    const comment = comments[commentIndex]; // 댓글 데이터 가져오기
    if (comment.user_id !== Number(user_id)) {
        throw new Error("권한이 없습니다."); // 403 에러
    }

    comments.splice(commentIndex, 1); // 댓글 삭제
    fs.writeFileSync(dataPath, JSON.stringify(comments, null, 2), 'utf-8'); // 변경된 데이터를 파일에 저장

    updateCommentCount(post_id, false); // 댓글 수 업데이트
};

// 댓글 업데이트
export const updateCommentsByUserId = (user_id, updatedData) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const updatedComments = comments.map(comment => ({
        ...comment,
        nickname: updatedData.nickname || comment.nickname,
        profile_image_path: updatedData.profile_image_path || comment.profile_image_path,
    }));
    fs.writeFileSync(dataPath, JSON.stringify(updatedComments, null, 2), 'utf-8');
};
