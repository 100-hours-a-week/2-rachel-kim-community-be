const jwt = require('jsonwebtoken');

// JWT 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer 토큰 형태
    if (!token) return res.status(401).json({ message: 'required_authorization' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // JWT 페이로드 (user_id 등)를 req.user에 할당
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(403).json({ message: 'invalid_token' });
    }
};

module.exports = { authenticateToken };