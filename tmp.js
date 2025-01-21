/* 더미 비밀번호 해시 성성 */
import bcrypt from 'bcrypt';

// // 새로운 비밀번호
// const plainPassword1 = 'Password@123'; // user1의 비밀번호
// const plainPassword2 = 'Secure#456';  // user2의 비밀번호

// // 비밀번호 해시 생성
// const hashedPassword1 = bcrypt.hashSync(plainPassword1, 10);
// const hashedPassword2 = bcrypt.hashSync(plainPassword2, 10);

// // 생성된 해시 출력
// console.log('User1:', hashedPassword1);
// console.log('User2:', hashedPassword2);

// /* 시크릿 랜덤 키 생성*/
// // 암호화(cryptography) 관련 기능을 제공하는 내장(built-in) 모듈
// const crypto = require('crypto');

// const secretKey = crypto.randomBytes(32).toString('hex'); // 64자 16진수 문자열
// console.log(secretKey);


const plainPassword = 'Test0910@';
bcrypt.hash(plainPassword, 10)
    .then(hashedPassword => {
        console.log('해시된 비밀번호:', hashedPassword);
        // 이후 이 값을 사용하여 데이터베이스에 삽입
    })
    .catch(err => console.error('해시 생성 오류:', err));
