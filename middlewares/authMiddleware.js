const jwt = require('jsonwebtoken');
const users = require('../data/users.json'); 

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
    // Authorization 헤더에서 Bearer 토큰을 추출
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        console.error('Authorization 헤더가 없습니다.');
        return res.status(401).json({ message: 'no_token_provided' });
    }

    try {
        // 토큰 검증, 디코딩
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // 사용자 정보 확인
        const user = users.find(user => user.user_id === decoded.user_id);
        if (!user) {
            console.error('유효하지 않은 사용자:', decoded.user_id);
            return res.status(401).json({ message: 'user_not_found' });
        }

        // 인증된 사용자 정보 추가
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('JWT 토큰 만료:', error.message);
            return res.status(403).json({ status: 403, message: 'jwt_expired' });
        }
        console.error('JWT 인증 실패:', error.message);
        return res.status(403).json({ status: 403, message: 'invalid_token' });
    }
};

module.exports = { authenticateToken };