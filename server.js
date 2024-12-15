/*be/server.js*/
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // CORS 미들웨어
const path = require('path');
const bodyParser = require('body-parser'); // POST 데이터 처리
const userRoutes = require('./routes/userRoutes'); // 사용자 관련 라우터

const app = express();
const PORT = 4000;

// CORS 설정
app.use(cors()); // 모든 요청에 대해 CORS 허용

// JSON 요청 본문을 처리할 수 있도록 설정
app.use(bodyParser.json());

// 프론트엔드 파일 경로 설정
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// 사용자 관련 라우터 연결
app.use('/api/users', userRoutes);  // /api/users/login 처럼 앞에 /api/users가 자동으로 붙음

// HTML 파일을 제공하는 경로 설정
app.get('/', (req, res) => {
    res.redirect('/login');  // 기본적으로 로그인 페이지로 리다이렉트
});

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중 입니다.`);
});