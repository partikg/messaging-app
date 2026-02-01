const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/message'),
    filename: (req, file, cb) => {
        cb(null, 'message-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.get('/:chatId', protect, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const isMember = chat.users.some(
            user => user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: "Not allowed" });
        }

        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name email');

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

router.post('/image', protect, upload.single('image'), async (req, res) => {
    try {
        const { chatId } = req.body;
        if (!chatId || !req.file) return res.status(400).json({ message: 'chatId and image required' });

        const newMessage = new Message({
            sender: req.user._id,
            chat: chatId,
            content: '',
            image: `/uploads/message/${req.file.filename}`
        });

        const savedMessage = await newMessage.save();

        const fullMessage = await Message.findById(savedMessage._id)
            .populate("sender", "name email");
        console.log("Full message BEFORE emit:", fullMessage.sender);

        req.app
            .get("io")
            .to(chatId)
            .emit("receiveMessage", JSON.parse(JSON.stringify(fullMessage)));
        console.log("Message emitted for chat:", chatId);

        res.status(201).json(fullMessage);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


module.exports = router;