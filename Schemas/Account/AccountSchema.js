
const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxlength: 30
    },
    display_name: {
        type: String,
        required: true,
        maxlength: 30
    },
    bio: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    user_image: {
        type: String,
        required: false,
        default: "",
    },
    user_banner: {
        type: String,
        required: false,
        default: ""
    },
    secret: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    account_creation_date: {
        type: Date,
        default: Date.now,
    },
    last_log_in: {
        type: Date
    },
    new_account_state: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    joined_servers: {
        type: [String],
        default: []
    },
    created_servers: {
        type: [String],
        default: []
    },
    profile_picture_shape: {
        type: String,
        default: 'circle'
    }
})

// handle sign in
AccountSchema.methods.generate_secret = function() {
    const min = 10000;
    const max = 90000;

    const number = Math.floor(Math.random() * min) + max;

    this.secret = number;

    return this.save();
}

AccountSchema.methods.update_profile_shape = function(shape) {

    this.profile_picture_shape = shape;

    return this.save();

}

AccountSchema.methods.update_verification_state = function(bool) {
    this.verified = bool
    
    return this.save();
}

// account edits
AccountSchema.methods.update_user_image = function(image) {

    this.user_image = image;

    return this.save();
}

AccountSchema.methods.update_user_banner = function(image) {

    this.user_banner = image;
    
    return this.save();
}

AccountSchema.methods.update_user_password = function(hash) {
    this.password = hash;

    return this.save();
}

AccountSchema.methods.update_display_name = function(new_name) {
    this.display_name = new_name;

    return this.save();
}

AccountSchema.methods.update_last_login = function() {
    this.last_log_in = new Date.now();

    return this.save();
}

AccountSchema.methods.update_new_account_state = function(bool) {
    this.new_account_state = bool;

    return this.save();
}

// server functionality methods below
AccountSchema.methods.join_server = function(server_id) {

    this.joined_servers.push(server_id);

    return this.save();
}

AccountSchema.methods.user_has_been_banned = function(server_id) {
    try {

        this.joined_servers = this.joined_servers.filter(server => server !== server_id);

        return this.save();

    } catch (error) {
        return {error: "Error finding and removing server_id"}
    }
}

AccountSchema.methods.update_bio = function(value) {
    this.bio = value;

    return this.save();
}

// creating server
AccountSchema.methods.push_created_server_id = function(server_id) {
    try {
        if (!this.created_servers.includes(server_id)) {
            this.created_servers.push(server_id)
            return this.save();
        } else {
            return {error: true, errorMessage: "Server with the following id already exists"}
        }
    } catch (error) {
        return {error: true, errorMessage: "Fatal Error Creating Server"}
    }
}

module.exports.AccountSchema = mongoose.model("AccountSchema", AccountSchema);