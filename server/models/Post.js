const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    author: { type: String, required: true },
    content: { type: String, required: true },
    likes: { type: [String], default: [] }, // Массив строк (имен пользователей)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);