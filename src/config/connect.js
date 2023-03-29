const mongoose = require('mongoose');
const connectDb = () => {
    try {
        mongoose
            .connect(
                `mongodb+srv://${process.env.MONGOOSE_DB_USERNAME}:${process.env.MONGOOSE_DB_PASSWORD}@cluster0.82pxez3.mongodb.net/?retryWrites=true&w=majority`,
                {},
            )
            .then(() => {
                console.log('connect database');
            });
    } catch (error) {
        console.log(error);
    }
};
module.exports = connectDb;
