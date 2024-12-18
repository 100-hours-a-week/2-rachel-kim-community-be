/*be/server.js*/
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); 
const bodyParser = require('body-parser'); 
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
const PORT = 4000;

//app.use(cors()); 
app.use(cors({
    origin: "http://3.39.23.86:3000", // 프론트엔드 주소
    methods: "GET,POST,PUT,DELETE",
    credentials: true
  }));
  

//나중에 지워라
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src *; img-src * data: 'unsafe-inline'");
    next();
});

app.use(bodyParser.json());
// 정적 파일 제공 설정
app.use('/public', express.static(path.join(__dirname, 'public')));

// 사용자 관련 라우터
app.use('/api/users', userRoutes); 
// 게시글 관련 라우터
app.use('/api/posts', postRoutes);

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중 입니다.`);
});