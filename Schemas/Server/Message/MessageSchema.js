
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    _id: {
        default: mongoose.ObjectId
    },
    channel_id: {
        type: String
    },
    content: {
        type: {Object},
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true
    }
})


module.exports = MessageSchema;