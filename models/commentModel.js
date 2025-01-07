/* commentModel.js */
const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/comments.json');

// 댓글 목록 조회
const getCommentsByPostId = (post_id) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 댓글 데이터 읽기
    const filteredComments = comments.filter(comment => comment.post_id === Number(post_id));

    if (filteredComments.length === 0) {
        throw new Error("댓글이 없습니다."); // 404 에러
    }

    return filteredComments.map(comment => ({
        ...comment,
        profile_image_path: comment.profile_image_path || "/public/image/profile/default-profile.jpeg",
    }));
};

// 댓글 등록
const addComment = (postId, content, userId, userNickname, userProfileImage) => {    
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 파일에서 댓글 데이터 읽기

    const newComment = {
        comment_id: comments.length + 1,
        post_id: Number(postId),
        comment_content: content,
        user_id: userId,
        nickname: userNickname,
        created_at: new Date().toISOString(),
        profile_image_path: userProfileImage || "/public/image/profile/default-profile.jpeg",
    };

    comments.push(newComment); // 댓글 추가
    fs.writeFileSync(dataPath, JSON.stringify(comments, null, 2), 'utf-8'); // 파일 저장

    return newComment;
};

// 댓글 수정
const updateComment = (post_id, comment_id, content, user_id) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 최신 데이터 읽기

    // 댓글 찾기
    const comment = comments.find(comment => comment.comment_id === Number(comment_id));

    if (!comment) {
        throw new Error("댓글을 찾을 수 없습니다."); // 404 에러
    }

    if (comment.post_id !== Number(post_id)) {
        throw new Error("댓글이 해당 게시글에 속하지 않습니다."); // 400 에러 (논리적 오류)
    }

    if (comment.user_id !== Number(user_id)) {
        throw new Error("권한이 없습니다."); // 403 에러
    }

    // 댓글 수정
    comment.comment_content = content;
    comment.updated_at = new Date().toISOString();

    // 변경 사항 저장
    fs.writeFileSync(dataPath, JSON.stringify(comments, null, 2), 'utf-8');
    return comment;
};

// 댓글 삭제
const deleteComment = (post_id, comment_id, user_id) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); // 최신 데이터 읽기

    // 댓글 인덱스 찾기
    const commentIndex = comments.findIndex(comment => 
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

    // 댓글 삭제
    comments.splice(commentIndex, 1);

    // 변경된 데이터를 파일에 저장
    fs.writeFileSync(dataPath, JSON.stringify(comments, null, 2), 'utf-8'); // 파일 저장
};

// 댓글 업데이트
const updateCommentsByUserId = (user_id, updatedData) => {
    const comments = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const updatedComments = comments.map(comment => {
        if (comment.user_id === user_id) {
            return {
                ...comment,
                nickname: updatedData.nickname || comment.nickname,
                profile_image_path: updatedData.profile_image_path || comment.profile_image_path,
            };
        }
        return comment;
    });
    fs.writeFileSync(dataPath, JSON.stringify(updatedComments, null, 2), 'utf-8');
};

module.exports = { getCommentsByPostId, addComment, updateComment, deleteComment, updateCommentsByUserId };

