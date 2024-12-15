/* 더미 비밀번호 해시 성성 */

const bcrypt = require('bcrypt');

// 새로운 비밀번호
const plainPassword1 = 'Password@123'; // user1의 비밀번호
const plainPassword2 = 'Secure#456';  // user2의 비밀번호

// 비밀번호 해시 생성
const hashedPassword1 = bcrypt.hashSync(plainPassword1, 10);
const hashedPassword2 = bcrypt.hashSync(plainPassword2, 10);

// 생성된 해시 출력
console.log('User1:', hashedPassword1);
console.log('User2:', hashedPassword2);



