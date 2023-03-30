const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDb = require('./src/config/connect');
const userRouter = require('./src/router/userRouter');
const chatRouter = require('./src/router/chatRouter');
const messageRouter = require('./src/router/messageRouter');
const cloudinary = require('cloudinary').v2;
const path = require('path');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 100000, limit: '500mb' }));
app.use(bodyParser.json());
require('dotenv').config();
connectDb();
app.use('/api', userRouter);
app.use('/api', chatRouter);
app.use('/api', messageRouter);
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
cloudinary.config({
    cloud_name: 'dqwzzgavd',
    api_key: '527248261528922',
    api_secret: 'H5EE9qM0dvgr4b9VXzN-PK-cBL4',
});
const server = app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
});
var io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
    },
});
app.get('/', (req, res) => {
    return res.send('Hello !!');
});

io.on('connection', (socket) => {
    console.log('connect to socket.io');
    socket.on('setup', (userData) => {
        socket.join(userData);
        socket.emit('connection');
    });
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User join room: ' + room);
    });
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('newMessage', (newMessageRecieved) => {
        let chat = newMessageRecieved.chat;
        console.log(chat);
        console.log(newMessageRecieved);
        if (!chat.user) {
            return console.log('chat user not define');
        }
        chat.user.forEach((item) => {
            if (item._id == newMessageRecieved.sender._id) {
                return;
            }
            io.emit('newMessage', newMessageRecieved);
        });
    });
});
