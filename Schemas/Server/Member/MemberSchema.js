
const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    user_image: {
        type: String,
        default: "",
    },
    user_banner: {
        type: String,
        default: "",
    },
    server_group: {
        type: String,
        required: true,
    },
    display_name: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "offline"
    },
    join_date: {
        type: Date,
        default: Date.now
    },
    profile_picture_shape: {
        type: String,
        default: 'circle'
    },
    server_score: {
        default: 0,
        type: Number
    },
    last_online: {
        type: Number
    },
    color: {
        type: String
    }
})



module.exports = MemberSchema;