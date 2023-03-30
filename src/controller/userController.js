const modelUser = require('../model/userModel');
const generateJWT = require('../config/generateJWT');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const uploadImage = (fileUpload) => {
    return new Promise(async (resolve, reject) => {
        let picture = await cloudinary.uploader.upload(fileUpload, (error, result) => {
            resolve({
                url: result?.secure_url,
                asset_id: result?.asset_id,
                public_id: result?.public_id,
            });
        });
    });
};
const registerUser = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            // console.log(req.body);
            // console.log(req.file);
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                resolve(res.status(400).json('Please Enter All the Feilds'));
            }
            const existUser = await modelUser.find({ email });
            if (existUser.length > 0) {
                console.log(existUser);
                resolve(res.status(400).json('user Already exist'));
            } else {
                // const picture = await uploadImage(req?.file?.path);
                // console.log(picture);
                const user = await modelUser.create({
                    name,
                    email,
                    password,
                    // picture: picture.url,
                });
                if (user) {
                    resolve(
                        res.status(201).json({
                            ...user._doc,
                        }),
                    );
                } else {
                    resolve(res.status(400).json('Fail to create user'));
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

const authUser = (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { email, password } = req.body;
            console.log(password);
            const existUser = modelUser.findOne({ email }).exec((error, user) => {
                if (user) {
                    if (!req.body.password || !user.password) {
                        return res.status(200).json({
                            message: 'Empty password',
                        });
                    }
                    const compare = bcrypt.compareSync(password, user.password);
                    console.log(compare);
                    if (compare) {
                        resolve(
                            res.status(200).json({
                                token: generateJWT(user._id),
                                user: {
                                    name: user.name,
                                    email: user.email,
                                    pic: user.picture,
                                },
                            }),
                        );
                    }
                } else {
                    resolve(
                        res.status(404).json({
                            message: 'user not exist in system',
                        }),
                    );
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};
const AllUser = (req, res) => {
    return new Promise(async (resolve, reject) => {
        const keyWord = req.query.search
            ? {
                  $or: [
                      {
                          name: { $regex: req.query.search, $options: 'i' },
                      },
                      {
                          email: { $regex: req.query.search, $options: 'i' },
                      },
                  ],
              }
            : {};
        const user = await modelUser.find(keyWord).find({
            _id: {
                $ne: req.user._id,
            },
        });
        resolve(res.status(200).json(user));
    });
};
module.exports = { registerUser, authUser, AllUser };
