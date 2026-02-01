const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId required" });
        }

        // check existing chat
        let chat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [req.user._id, userId] }
        });

        if (chat) {
            return res.json(chat);
        }

        chat = await Chat.create({
            users: [req.user._id, userId],
            isGroupChat: false
        });

        res.status(201).json(chat);

    } catch (err) {
        console.error("CHAT CREATE ERROR:", err);
        res.status(500).send('Server error');
    }
});


router.get('/', protect, async (req, res) => {
    try {
        const chats = await Chat.find({ users: req.user._id }).populate('users', 'name email');

        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;