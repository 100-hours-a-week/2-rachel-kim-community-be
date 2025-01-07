const jwt = require('jsonwebtoken');
const users = require('../data/users.json'); 

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
    // Authorization 헤더에서 Bearer 토큰을 추출
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.error('Authorization 헤더가 없습니다.');
        return res.status(401).json({ message: 'required_authorization' });
    }

    try {
        // 토큰 검증, 디코딩
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // 디버깅
        console.log('디코딩된 토큰:', decoded);

        const user = users.find(user => user.user_id === decoded.user_id);
        if (!user) {
            console.error('토큰의 user_id와 일치하는 사용자를 찾을 수 없습니다.');
            return res.status(401).json({ message: 'User not found' });
        }

        // 사용자 정보를 req.user에 추가
        req.user = user; 
        next();
    } catch (error) {
        console.error('JWT 인증 실패:', error.message);
        return res.status(403).json({ message: 'invalid_token' });
    }
};

module.exports = { authenticateToken };