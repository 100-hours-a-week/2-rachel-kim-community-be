/*be/server.js*/
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// CORS 설정
app.use(cors()); 
/*app.use(cors({
    origin: "http://3.39.23.86:3000", // 프론트엔드 주소
    methods: "GET,POST,PUT,DELETE",
    credentials: true
  }));*/

// JSON 데이터 처리를 위한 미들웨어 설정
app.use(bodyParser.json());

// 정적 파일 제공 설정
app.use('/public', express.static(path.join(__dirname, 'public')));

// 사용자 관련 라우터
app.use('/api/users', userRoutes); 

// 게시글 관련 라우터
app.use('/api/posts', postRoutes);

// 댓글 관련 라우터 
app.use('/api/posts/:post_id/comments', commentRoutes);

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중 입니다.`);
});