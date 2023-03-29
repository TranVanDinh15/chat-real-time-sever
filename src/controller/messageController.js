const modelMessage = require('../model/messageModel');
const User = require('../model/userModel');
const Chat = require('../model/chatModel');
const sendMessage = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { chatId, content } = req.body;
            if (!chatId || !content) {
                resolve(
                    res.status(400).json({
                        message: 'Miss data',
                    }),
                );
            }
            const newMessage = {
                sender: req.user._id,
                content: content,
                chat: chatId,
            };
            let message = await modelMessage.create(newMessage);
            message = await message.populate('sender', 'name picture');
            message = await message.populate('chat');
            message = await User.populate(message, {
                path: 'chat.user',
                select: 'name picture email',
            });
            await Chat.findByIdAndUpdate(req.body.chatId, {
                lastestMessage: message,
            });
            res.json(message);
        } catch (error) {
            reject(error);
        }
    });
};
const getMessageById = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(req.params);
            const message = modelMessage
                .find({ chat: req.params.chatId })
                .populate('sender', 'name email picture')
                .populate('chat')
                .exec((error, user) => {
                    if (error) {
                        resolve(res.status(400).json(error));
                    }
                    if (user) {
                        resolve(res.status(200).json(user));
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
};
module.exports = {
    sendMessage,
    getMessageById,
};
