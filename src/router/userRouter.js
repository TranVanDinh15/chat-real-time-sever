const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const middelWare = require('../middleWare/middleware');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'uploads'));
    },
    filename: function (req, file, cb) {
        //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, shortid.generate() + '-' + file.originalname);
    },
});
const upload = multer({ storage: storage });
router.post('/createUser', upload.single('pic'), userController.registerUser);
router.post('/authUser', userController.authUser);
router.post('/searchUser', middelWare.requireSigin, userController.AllUser);
module.exports = router;
