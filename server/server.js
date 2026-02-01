const express = require('express');
var cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const jwt = require("jsonwebtoken");
const { Server } = require('socket.io');
const Message = require('./models/Message');
require('dotenv').config();

const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes);

const chatRoutes = require('./routes/chat')
app.use('/api/chat', chatRoutes);

const messageRoutes = require('./routes/message')
app.use('/api/message', messageRoutes);

app.use('/api/users', require('./routes/users'));

app.use('/uploads/message', express.static('uploads/message'));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.set("io", io);

io.on('connection', (socket) => {

    const token = socket.handshake.auth?.token;

    if (!token) {
        console.log("No token provided");
        socket.disconnect();
        return;
    }

    try {
        const token = socket.handshake.auth?.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;

        console.log("DECODED TOKEN:", decoded);
        console.log("Connected userId:", socket.userId);

        console.log("Socket user authenticated:", socket.userId);
    } catch (err) {
        console.log("Socket auth failed:", err.message);
        socket.disconnect();
        return;
    }

    socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.userId} joined room ${chatId}`);
    });

    socket.on("sendMessage", async ({ chatId, content }) => {
        console.log("SENDING MESSAGE AS:", socket.userId);

        if (!chatId || !content) return;

        try {
            const message = await Message.create({
                sender: socket.userId,
                chat: chatId,
                content,
            });

            const fullMessage = await Message.findById(message._id)
                .populate("sender", "name email");

            io.to(chatId).emit("receiveMessage", fullMessage);

            console.log("Full message sender:", fullMessage.sender);

            console.log("Message sent:", fullMessage.content);
        } catch (err) {
            console.log("Send message error:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log("Socket disconnected:", socket.id);
    });
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));