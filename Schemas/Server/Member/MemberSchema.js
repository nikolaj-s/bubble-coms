
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
    join_date: {
        type: Date,
        default: Date.now
    }
})



module.exports = MemberSchema;