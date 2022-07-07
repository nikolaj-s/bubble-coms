
const mongoose = require('mongoose');

const ServerCardSchema = new mongoose.Schema({
    server_id: {
        type: String,
        required: true
    },
    server_name: {
        type: String,
        required: true
    },
    server_banner: {
        type: String,
        default: ""
    }
})

ServerCardSchema.methods.update_server_name = function(name) {
    try {
        this.server_name = name;

        return this.save();

    } catch (error) {   
        return {error: true, errorMessage: "Error Updating Server Name"};
    }
}

ServerCardSchema.methods.update_server_banner = function(image) {
    try {
        this.server_banner = image;

        return this.save();
        
    } catch (error) {
        return {error: true, errorMessage: "Error Updating Server Banner"}
    }
    
}

module.exports.ServerCardSchema = mongoose.model('ServerCardSchema', ServerCardSchema);