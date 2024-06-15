
const mongoose = require('mongoose');

const ServerGroupSchema = new mongoose.Schema({
    server_group_name: {
        type: String,
        required: true,
        default: "Guest"
    },
    user_can_view_channel_content: {
        type: Boolean,
        default: false
    },
    user_can_post_channel_social: {
        type: Boolean,
        default: false
    },
    user_can_manage_channels: {
        type: Boolean,
        default: false,
    },
    user_can_manage_server_groups: {
        type: Boolean,
        default: false,
    },
    user_can_kick_user: {
        type: Boolean,
        default: false
    },
    user_can_ban_user: {
        type: Boolean,
        default: false
    },
    user_can_edit_server_banner: {
        type: Boolean,
        default: false,
    },
    user_can_edit_server_name: {
        type: Boolean,
        default: false,
    },
    user_can_edit_server_password: {
        type: Boolean,
        default: false
    },
    user_can_create_channels: {
        type: Boolean,
        default: false
    },
    user_can_delete_channels: {
        type: Boolean,
        default: false
    },
    user_can_create_server_groups: {
        type: Boolean,
        default: false
    },
    user_can_delete_server_groups: {
        type: Boolean,
        default: false,
    },
    user_can_delete_other_users_messages: {
        type: Boolean,
        default: false
    },
    user_can_move_users: {
        type: Boolean,
        default: false
    },
    user_can_manage_server_safe_search: {
        type: Boolean,
        default: false
    }
})

module.exports = ServerGroupSchema;