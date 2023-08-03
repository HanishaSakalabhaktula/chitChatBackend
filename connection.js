const mongoose = require('mongoose');
require('dotenv').config();

module.exports = mongoose.connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database connection successful")
}).catch((e) => {
    console.log("Connection failed")
    console.log(e);
})