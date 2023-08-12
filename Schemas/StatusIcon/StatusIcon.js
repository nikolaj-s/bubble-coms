const mongoose = require("mongoose");

const StatusIcon = new mongoose.Schema({
    status: {
        type: String,
    },
    icon: {
        type: String
    }
})

module.exports.StatusIcon = mongoose.model("StatusIcon", StatusIcon);