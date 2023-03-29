const express = require('express');
const router = express.Router();
const middelWare = require('../middleWare/middleware');
const messageController = require('../controller/messageController');
router.post('/sendMessage', middelWare.requireSigin, messageController.sendMessage);
router.get('/getChat/:chatId', middelWare.requireSigin, messageController.getMessageById);

module.exports = router;
