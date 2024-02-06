const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    channel_id: {
        type: String,
        required: true,
    },
    content: {
        type: Object
    },
    server_id: {
        type: String,
    },
    username: {
        type: String,
        required: true,
    },
    comments: {
        type: Array,
        default: []
    },
    pinned: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    screen_shot: {
        type: Boolean,
        default: false
    },
    nsfw: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: false
    },
    song: {
        type: Boolean,
        default: false
    }
})

module.exports.MessageSchema = mongoose.model("MessageSchema", MessageSchema);