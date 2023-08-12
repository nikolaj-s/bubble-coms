
const mongoose = require('mongoose');

const { MessageSchema } = require("../Message/MessageSchema");
const { WidgetSchema } = require("../Widget/WidgetSchema");

const ChannelSchema = new mongoose.Schema({
    channel_name: {
        type: String,
        required: true,
        maxlength: 128
    },
    widgets: {
        type: [],
        default: []
    },
    icon: {
        type: String
    },
    social: {
        type: [],
        default: []
    },
    persist_social: {
        type: Boolean,
        default: false
    },
    channel_background: {
        type: String
    },
    background_blur: {
        type: Number
    },
    log: {
        type: [],
        default: []
    },
    disable_streams: {
        type: Boolean,
        default: false
    },
    auth_users: {
        type: [],
        default: []
    },
    locked_channel: {
        type: Boolean,
        default: false
    },
    text_only: {
        type: Boolean,
        default: false
    },
    last_message_id: {
        type: String,
    },
    message_count: {
        type: Number,
        default: 0
    },
    channel_owner: {
        type: String
    },
    locked_media: {
        type: Boolean,
        default: false
    },
    media_auth: {
        type: [],
        default: []
    }
})


module.exports = ChannelSchema;