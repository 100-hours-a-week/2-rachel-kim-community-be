/* userModel.js */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dataPath = path.join(__dirname, '../data/users.json');

const getUsers = () => {
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data);
};

const findUserByEmail = (email) => {
    const users = getUsers();
    console.log('사용자 목록:', users);
    return users.find(user => user.email === email);
};

// User1: Password@123, User2: Secure#456
const verifyPassword = (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
};

module.exports = { findUserByEmail, verifyPassword };
