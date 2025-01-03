const jwt = require('jsonwebtoken');
const users = require('../data/users.json'); 

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
    // Authorization 헤더에서 Bearer 토큰을 추출
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'required_authorization' });

    try {
        // 토큰 검증, 디코딩
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = users.find(user => user.user_id === decoded.user_id); 

        if (!user) {
            return res.status(401).json({ status: 401, message: 'User not found' });
        }
        // 사용자 정보를 req.user에 추가
        req.user = user; 
        next();
    } catch (error) {
        return res.status(403).json({ message: 'invalid_token' });
    }
};

module.exports = { authenticateToken };