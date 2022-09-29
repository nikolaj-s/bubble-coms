
const mongoose = require('mongoose');

const ReleaseNotes = new mongoose.Schema({
    version_name: {
        type: String
    },
    release_notes: {
        type: String
    }
})

module.exports.ReleaseNotes = mongoose.model('ReleaseNotes', ReleaseNotes);