
const mongoose = require('mongoose');

const WidgetSchema = new mongoose.Schema({
    content: {
        type: Object,
    },
    type: {
        type: String,
    }
})

module.exports = WidgetSchema;