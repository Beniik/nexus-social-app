const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "Новый пользователь сети ВЗалупе" },
    friends: { type: [String], default: [] }
});

// ВАЖНО: Эту строку нельзя забывать!
module.exports = mongoose.model('User', UserSchema);

