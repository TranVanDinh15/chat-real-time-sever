const chatModel = require('../model/chatModel');
const User = require('../model/userModel');
exports.createNewChat = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
        } catch (error) {
            reject(error);
        }
    });
};
exports.accessChat = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { userId } = req.body;
            console.log(req.user);
            if (!userId) {
                resolve(
                    res.status(400).json({
                        message: 'UserId param not sent with request',
                    }),
                );
            }
            let isChat = await chatModel
                .find({
                    isGroupChat: false,
                    user: [req.user._id, userId],
                })
                .populate('user', '-password')
                .populate('lastestMessage');
            isChat = await User.populate(isChat, {
                path: 'lastestMessage.sender',
                select: 'name email picture',
            });
            console.log(isChat);
            if (isChat.length > 0) {
                // res.send(isChat[0]);
                return res.status(200).json(isChat[0]);
            } else {
                let chatData = {
                    chatName: 'sender',
                    isGroupChat: false,
                    user: [req.user._id, userId],
                };
                try {
                    const createChat = await chatModel.create(chatData);
                    const fullChat = await chatModel
                        .findOne({
                            _id: createChat._id,
                        })
                        .populate('user', '-password');
                    // .select('name email picture');
                    fullChat = await User.populate(fullChat, {
                        path: 'lastestMessage.sender',
                        select: 'name email picture',
                    });
                    return res.status(200).json(fullChat);
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};
exports.fetchChat = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            chatModel
                .find({
                    user: {
                        $elemMatch: {
                            $eq: req.user._id,
                        },
                    },
                })
                .populate('user', '-password')
                .populate('groupAdmin', '-password')
                .populate('lastestMessage')
                .sort({
                    updatedAt: -1,
                })
                .exec(async (error, result) => {
                    if (error) {
                        resolve(res.status(500).json(error));
                    }
                    if (result) {
                        result = await User.populate(result, {
                            path: 'lastestMessage.sender',
                            select: 'name pic email',
                        });
                        resolve(res.status(200).json(result));
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
};
exports.createGroupChat = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(req.body);
            if (!req.body.user || !req.body.name) {
                resolve(
                    res.status(400).json({
                        message: 'Please enter all the feilds ',
                    }),
                );
            } else {
                let users = JSON.parse(req.body.user);
                if (users.length < 2) {
                    res.status(200).json({
                        message: 'More than 2 user are require to from a group chat',
                    });
                }
                users.push(req.user);
                try {
                    const groupChat = await chatModel.create({
                        chatName: req.body.name,
                        isGroupChat: true,
                        user: users,
                        groupAdmin: req.user,
                    });
                    console.log(groupChat);
                    chatModel
                        .findOne({ _id: groupChat._id })
                        .populate('user', '-password')
                        .populate('groupAdmin', '-password')
                        .exec((error, group) => {
                            if (error) {
                                resolve(res.status(400).json(error));
                            }
                            if (group) {
                                resolve(res.status(200).json(group));
                            }
                        });
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};
exports.renameGroup = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { chatId, chatName } = req.body;
            const updateChat = await chatModel
                .findByIdAndUpdate(
                    chatId,
                    {
                        chatName,
                    },
                    {
                        new: true,
                    },
                )
                .populate('user', '-password')
                .populate('groupAdmin', '-password')
                .exec((error, updateChat) => {
                    if (error) {
                        resolve(res.status(400).json(error));
                    }
                    if (updateChat) {
                        resolve(res.status(200).json(updateChat));
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
};
exports.addtoGroup = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { chatId, userId } = req.body;
            const added = await chatModel
                .findByIdAndUpdate(
                    chatId,
                    {
                        $push: {
                            user: userId,
                        },
                    },
                    {
                        new: true,
                    },
                )
                .populate('user', '-password')
                .populate('groupAdmin', '-password')
                .exec((error, updateChat) => {
                    if (error) {
                        resolve(res.status(400).json(error));
                    }
                    if (updateChat) {
                        resolve(res.status(200).json(updateChat));
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
};
exports.removeGroup = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { chatId, userId } = req.body;
            const added = await chatModel
                .findByIdAndUpdate(
                    chatId,
                    {
                        $pull: {
                            user: userId,
                        },
                    },
                    {
                        new: true,
                    },
                )
                .populate('user', '-password')
                .populate('groupAdmin', '-password')
                .exec((error, updateChat) => {
                    if (error) {
                        resolve(res.status(400).json(error));
                    }
                    if (updateChat) {
                        resolve(res.status(200).json(updateChat));
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
};
