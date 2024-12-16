/*be/server.js*/
require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser'); 
const userRoutes = require('./routes/userRoutes'); 

const app = express();
const PORT = 4000;

app.use(cors()); 
app.use(bodyParser.json());

// 사용자 관련 라우터 연결
app.use('/api/users', userRoutes); 

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중 입니다.`);
});