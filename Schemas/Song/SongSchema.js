
const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    id: {
        type: String
    },
    duration: {
        type: Number
    },
    thumbnail: {
        type: String
    },
    url: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    author: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    server_id: {
        type: String
    }
})

module.exports.SongSchema = mongoose.model("SongSchema", SongSchema);