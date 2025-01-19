/*authMiddleware.js*/

// 세션 검증 미들웨어
export const authenticateSession = (req, res, next) => {    
    if (req.session && req.session.user) {
        req.user = req.session.user; // 세션에서 사용자 정보 추가        next();
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
