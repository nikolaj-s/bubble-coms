
const mongoose = require('mongoose');

const ProfileDecoration = new mongoose.Schema({
    decoration: {
        type: String
    }
})

module.exports.ProfileDecoration = mongoose.model('ProfileDecoration', ProfileDecoration);