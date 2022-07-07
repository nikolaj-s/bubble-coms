
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    user_name: {
        type: String,
        required: true
    }
})


module.exports = MessageSchema;