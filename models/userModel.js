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

//new
const saveUsers = (users) => {
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
};

const findUserByNickname = (nickname) => {
    const users = getUsers();
    return users.find(user => user.nickname === nickname);
};

const saveUser = (userData) => {
    const users = getUsers();
    const newUser = {
        user_id: users.length + 1,
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
        profile_image_path: userData.profileImagePath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
    };
    users.push(newUser);
    saveUsers(users);
    return newUser.id;
};

module.exports = { findUserByEmail, verifyPassword, findUserByNickname, saveUser };
