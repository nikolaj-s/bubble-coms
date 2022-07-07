
const mongoose = require('mongoose');

const BanSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true
    },
    date_banned: {
        type: Date,
        default: Date.now
    }
})

module.exports = BanSchema;