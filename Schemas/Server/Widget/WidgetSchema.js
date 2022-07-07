
const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
    content: {
        type: [String],
    },
    type: {
        type: String,
    }
})

module.exports = WidgetSchema;