import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 환경 변수를 자동으로 선택해서 로드
dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // 동시 접속 증가
    queueLimit: 0, // 대기 가능 요청 수
});

// ✅ 서버 실행 시 DB 연결 확인하는 코드 추가
const testDBConnection = async () => {
    try {
        const connection = await pool.getConnection();
        try {
       	    const [rows] = await connection.query('SELECT 1 + 1 AS result');
            if (!rows) throw new Error("쿼리 실행 실패 - rows가 비어 있음");
            console.log('✅ DB 연결 성공!', rows);
        } catch (queryError) {
            console.error('❌ SQL 실행 실패:', queryError.message);
        } finally {
            connection.release(); // 연결 해제
    	} 
    } catch (err) {
        console.error('❌ DB 연결 실패:', err.message);
    }
};

testDBConnection(); // 서버 실행 시 DB 연결 테스트

export default pool;
