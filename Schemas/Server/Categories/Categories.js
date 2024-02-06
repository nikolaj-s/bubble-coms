
const mongoose = require('mongoose');

const Categories = new mongoose.Schema({
    category_name: {
        type: String,
        required: true
    }
})

module.exports = Categories;