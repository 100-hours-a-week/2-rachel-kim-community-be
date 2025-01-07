const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 요청 경로에 따라 저장 경로 분기
        const routePath = req.originalUrl || req.baseUrl;

        if (routePath.includes('/api/users')) {
            cb(null, path.join(__dirname, '../public/image/profile')); // 프로필 사진 경로
        } else if (routePath.includes('/api/posts')) {
            cb(null, path.join(__dirname, '../public/image/posts')); // 게시글 사진 경로
        } else {
            cb(new Error('잘못된 요청 경로입니다.'));
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        file.storedFilename = `${uniqueSuffix}-${file.originalname}`; // 저장된 파일명
        cb(null, file.storedFilename);    
    },
});

const upload = multer({ storage });
module.exports = upload;