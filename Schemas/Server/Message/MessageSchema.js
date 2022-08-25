
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        default: mongoose.Types.ObjectId
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