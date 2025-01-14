/* postController.js */
const { getPosts, 
        getPostById, 
        deletePost, 
        savePost } = require('../models/postModel');
const fs = require('fs');
const path = require('path');
const posts = require('../data/posts.json');
const users = require('../data/users.json'); // 사용자 데이터 추가


// 게시글 목록 조회
const getPostsList = (req, res) => {
    try {
        // 데이터 가져오기
        const posts = getPosts();
        // 게시글 데이터가 없는 경우
        if (!posts || posts.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "not_a_single_post",
                data: null
            });
        }

        // 성공 응답
        res.status(200).json({
            status: 200,
            message: "get_posts_success",
            data: posts,
        });
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
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
}   

// 게시글 삭제
const removePost = (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user; 

    if (!post_id) {
        return res.status(400).json({ status: 400, message: "invalid_post_id", data: null });
    }

    try {
        const post = getPostById(post_id);
        if (!post) {
            return res.status(404).json({ status: 404, message: "not_a_single_post", data: null });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({ status: 403, message: "required_permission", data: null });
        }

        deletePost(post_id);
        return res.status(200).json({ status: 200, message: "delete_post_success", data: null });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
}; 

// 게시글 추가
const createPost = (req, res) => {
    const { postTitle, postContent } = req.body;
    const { file } = req;
    const { user_id } = req.user;
    const user = users.find(user => user.user_id === req.user.user_id);

    if (!postTitle || !postContent) {
        return res.status(400).json({ status: 400, message: "invalid_request", data: null});
    }
    if (postTitle.length > 26) {
        return res.status(400).json({ status: 400, message: "invalid_post_title_length", data: null });
    }

    const newPost = {
        post_id: posts.length ? posts[posts.length - 1].post_id + 1 : 1,
        user_id: user_id,
        post_title: postTitle,
        post_content: postContent,
        post_image_path: file ? `/public/image/posts/${file.filename}` : null,
        nickname: user ? user.nickname : null,
        profile_image_path: user ? user.profile_image_path : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes: 0, // 기본값
        likedUsers: [],
        views: 0, // 기본값
        viewedUsers: [],
        comment_count: 0 // 기본값
    };

    try {
        posts.push(newPost);
        // JSON 파일 업데이트
        fs.writeFileSync(path.join(__dirname, '../data/posts.json'), JSON.stringify(posts, null, 2), 'utf-8');
    
        return res.status(201).json({
            status: 201,
            message: "write_post_success",
            data: { post_id: newPost.post_id }
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 게시글 수정
const updatePost = (req, res) => {
    const { post_id } = req.params;
    const { postTitle, postContent, existingImagePath } = req.body;
    const { file } = req;   // 응답에서 처리
    const { user_id } = req.user;

    if (!post_id || !postTitle || !postContent) {
        return res.status(400).json({ status: 400, message: "invalid_request", data: null });
    }
    if (postTitle.length > 26) {
        return res.status(400).json({ status: 400, message: "invalid_post_title_length", data: null });
    }

    try {
        const postIndex = posts.findIndex(post => post.post_id === Number(post_id));
        if (postIndex === -1) {
            return res.status(404).json({ status: 404, message: "not_a_single_post", data: null });
        }

        const post = posts[postIndex];
        if (post.user_id !== user_id) {
            return res.status(403).json({ status: 403, message: "required_permission", data: null });
        }

        // 파일 경로 처리
        const updatedImagePath = file 
        ? `/public/image/posts/${file.storedFilename}` // 새 파일이 업로드된 경우
        : existingImagePath || post.post_image_path;   // 기존 경로 유지
        
        // 게시글 업데이트
        posts[postIndex] = {
            ...post,
            post_title: postTitle,
            post_content: postContent,
            post_image_path: updatedImagePath,
            updated_at: new Date().toISOString(),
        };

        fs.writeFileSync(path.join(__dirname, '../data/posts.json'), JSON.stringify(posts, null, 2), 'utf-8');

        return res.status(200).json({
            status: 200,
            message: "update_post_success",
            data: { post_id: post.post_id },
        });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

// 좋아요 상태 조회
const checkLikeStatus = (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user;

    const post = getPostById(post_id);
    if (!post) return res.status(404).send({ message: "Post not found" });

    const liked = post.likedUsers.includes(user_id);
    res.send({ liked, likeCount: post.likes });
};

// 좋아요 토글
const toggleLike = (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user;

    const post = getPostById(post_id);
    if (!post) return res.status(404).send({ message: "Post not found" });

    const alreadyLiked = post.likedUsers.includes(user_id);
    if (alreadyLiked) {
        post.likes -= 1;
        post.likedUsers = post.likedUsers.filter(id => id !== user_id);
    } else {
        post.likes += 1;
        post.likedUsers.push(user_id);
    }

    savePost(post);
    res.send({ likes: post.likes });
};

const updatePostView = (req, res) => {
    const { post_id } = req.params;
    const { user_id } = req.user;

    try {
        const post = getPostById(post_id);
        if (!post) {
            return res.status(404).json({ status: 404, message: "post_not_found", data: null });
        }

        // 조회수 중복 체크: user_id가 포함되지 않은 경우에만 증가
        if (!post.viewedUsers.includes(user_id)) {
            post.views += 1;
            post.viewedUsers.push(user_id); // 조회한 사용자 추가
            savePost(post);
        }
        
        return res.status(200).json({ status: 200, message: "view_count_updated", data: null });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "internal_server_error", data: null });
    }
};

module.exports = { 
    getPostsList, 
    getPostDetail, 
    removePost, 
    createPost, 
    updatePost, 
    checkLikeStatus, 
    toggleLike, 
    updatePostView };