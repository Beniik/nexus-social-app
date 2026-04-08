const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); 
const Post = require('./models/Post');

const app = express();
app.use(cors());
app.use(express.json());

const dbURI = 'mongodb+srv://vfhfdfwyed_db_user:TPMwvbB4WIvGartJ@cluster0.fyrhhne.mongodb.net/?appName=Cluster0';
mongoose.connect(dbURI).then(() => console.log('✅ DB Connected')).catch(e => console.error(e));

// Схема сообщения
const Message = mongoose.model('Message', new mongoose.Schema({
    sender: String, receiver: String, text: String, createdAt: { type: Date, default: Date.now }
}));

// --- API ---

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({error: "Имя занято"});
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            friends: [],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, // Авто-аватарка
            bio: ""
        });
        await newUser.save();
        res.json(newUser);
    } catch (err) { res.status(500).json({error: "Ошибка регистрации"}); }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(400).json({error: "Неверные данные"});
    }
    res.json(user);
});

// Редактирование профиля
app.put('/users/:username', async (req, res) => {
    const { avatar, bio } = req.body;
    const updated = await User.findOneAndUpdate(
        { username: req.params.username },
        { avatar, bio },
        { new: true }
    );
    res.json(updated);
});

// Умная лента (Рекомендации)
app.get('/recs/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username });
    // Берем посты друзей + самые залайканные посты других людей
    const posts = await Post.find().sort({ "likes.length": -1, createdAt: -1 }).limit(50);
    res.json(posts);
});

app.post('/posts', async (req, res) => {
    const { username, content, image, videoUrl } = req.body;
    // Превращаем обычную ссылку YouTube в embed
    let finalVideo = videoUrl;
    if (videoUrl?.includes('youtube.com/watch')) {
        finalVideo = videoUrl.replace('watch?v=', 'embed/');
    }
    const newPost = new Post({ author: username, content, image, videoUrl: finalVideo, likes: [] });
    await newPost.save();
    res.json(newPost);
});

app.post('/posts/:id/like', async (req, res) => {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    post.likes.includes(username) ? post.likes.pull(username) : post.likes.push(username);
    await post.save();
    res.json(post);
});

app.get('/messages/:me/:other', async (req, res) => {
    const history = await Message.find({
        $or: [{ sender: req.params.me, receiver: req.params.other }, { sender: req.params.other, receiver: req.params.me }]
    }).sort({ createdAt: 1 });
    res.json(history);
});

app.post('/messages', async (req, res) => {
    const newMsg = new Message(req.body);
    await newMsg.save();
    res.json(newMsg);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));