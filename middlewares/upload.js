const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 요청 경로에 따라 저장 경로 분기
        if (req.baseUrl.includes('/posts')) {
            cb(null, path.join(__dirname, '../public/image/posts')); // 게시글 이미지 경로
        } else if (req.baseUrl.includes('/profile')) {
            cb(null, path.join(__dirname, '../public/image/profile')); // 프로필 이미지 경로
        } else {
            cb(new Error('잘못된 요청 경로입니다.'));
        }    
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage });

module.exports = upload;