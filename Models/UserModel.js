const mongoose = require('mongoose');
const {isEmail} = require('validator');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String, 
        required: true
    }, 
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        index: true,
        validate: [isEmail, "invalid email"]
    },

    password: {
        type: String,
        required: true,
    },

    picture: {
        type: String, 
    },

    newMessage: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        default: 'Online'
    }, 

}, {minimize: false});


const User = mongoose.model('User', UserSchema);

module.exports = User;