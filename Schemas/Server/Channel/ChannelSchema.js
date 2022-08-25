
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
    social: {
        type: [],
        default: []
    },
    persist_social: {
        type: Boolean,
        default: false
    }
})


module.exports = ChannelSchema;