
const mongoose = require('mongoose');

const ChannelSchema = require("../Channel/ChannelSchema");
const MemberSchema = require("../Member/MemberSchema");
const BanSchema = require("../Ban/BanSchema");
const ServerGroupSchema = require('../ServerGroup/ServerGroupSchema');

const ServerSchema = new mongoose.Schema({
    server_name: {
        type: String,
        required: true,
        maxlength: 128
    },
    server_banner: {
        type: String
    },
    server_password: {
        type: String,
        required: true
    },
    members: [MemberSchema],
    channels: [ChannelSchema],
    ban_list: [BanSchema],
    server_groups: {
        type: [ServerGroupSchema],
        default: [
            {
                server_group_name: "Guest",
                user_can_view_channel_social: false,
                user_can_view_channel_widgets: false,
                user_can_post_channel_social: false,
                user_can_edit_channel_widgets: false,
                user_can_create_channel: false,
                user_can_assign_server_groups: false,
                user_can_create_server_groups: false,
                user_can_delete_server_groups: false,
                user_can_kick_user: false,
                user_can_ban_user: false,
                user_can_edit_server_banner: false,
                user_can_edit_server_name: false,
                user_can_edit_server_password: false,
            }, {
            server_group_name: "Owner",
            user_can_view_channel_social: true,
            user_can_view_channel_widgets: true,
            user_can_post_channel_social: true,
            user_can_edit_channel_widgets: true,
            user_can_create_channel: true,
            user_can_assign_server_groups: true,
            user_can_create_server_groups: true,
            user_can_delete_server_groups: true,
            user_can_kick_user: true,
            user_can_ban_user: true,
            user_can_edit_server_banner: true,
            user_can_edit_server_name: true,
            user_can_edit_server_password: true,
        }]
    },
    server_owner: {
        type: String,
        required: true
    }
})

// verify if user is in server
ServerSchema.methods.get_member = function(username) {
    try {
        const memberIndex = this.members.findIndex(member => {
            if (member.username === username) {
                return true
            }
        })

        return memberIndex === -1 ? memberIndex : this.members[memberIndex];
    } catch (error) {
        return {error: true, errorMessage: "User does not exist in this server"};
    }
}

ServerSchema.methods.update_member_user_image = function(member_index, image) {
    try {

        this.members[member_index].user_image = image;

        return this.save();

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.update_member_user_banner = function(member_index, image) {
    try {

        this.members[member_index].user_banner = image;

        return this.save();

    } catch(error) {
        return error;
    }
}

ServerSchema.methods.update_member_display_name = function(member_index, name) {
    try {

        this.members[member_index].display_name = name;

        return this.save();

    } catch(error) {
        return error;
    }
}

// handle joining server
ServerSchema.methods.user_joins_server = function(user_obj) {

    this.members.push(user_obj);

    return this.save();

}

ServerSchema.methods.kick_user = function(member_index) {
    try {

        this.members.splice(member_index, 1);

        return this.save();

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.ban_user = function(member_index) {
    try {

        const member = this.members[member_index];

        const ban_object = {
            username: member.username
        }

        this.ban_list.push(ban_object);

        this.members.splice(member_index, 1);

        return this.save();

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.verify_user_ban = function(username) {
    if (this.ban_list.length === 0) return false;

    const index = this.ban_list.findIndex(ban => ban.username === username);

    if (index === -1) {
        return false
    } else {
        return true
    }
}

// edit server
ServerSchema.methods.update_server_banner = function(image) {

    this.server_banner = image;

    return this.save();
}

ServerSchema.methods.update_server_name = function(name) {

    this.server_name = name;

    return this.save();
}

// verify user's permissions
ServerSchema.methods.verify_user_group = function(member_index, action) {

    const server_group = this.members[member_index].server_group;

    const server_group_index = this.server_groups.findIndex(el => {el._id === server_group});

    if (server_group_index === -1) {
        return {error: "server group does not exist"}
    }

    return this.server_groups[server_group_index][action]

}

// channel methods
ServerSchema.methods.create_channel = function(channel_object) {
    try {
        this.channels.push(channel_object)

        return this.save();
    
    } catch (error) {
        return error;
    }
}

ServerSchema.methods.get_channel = function(channel_id) {
    try {

        const channel_index = this.channels.findIndex(el => el._id === channel_id)

        if(channel_index === -1) return {error: "Error Channel Does Not Exist"}

        return channel_index;

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.save_message = function(channel_index, message) {
    try {

        this.channels[channel_index].social.push(message);

        return this.save();

    } catch (error) {
        return error;
    }

}

ServerSchema.methods.add_widget_to_channel = function(channel_index, widget) {
    try {

        this.channels[channel_index].content.push(widget);

        return this.save();
        
    } catch (error) {
        return error;
    }
}

// server groups
ServerSchema.methods.add_server_group = function(server_group) {
    try {

        this.server_groups.push(server_group)

        return this.save()

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.get_server_group = function(server_group_id) {
    try {

        const index = this.server_groups.findIndex(server_group => String(server_group._id) === server_group_id);

        return index === -1 ? index : this.server_groups[index];
        
    } catch (error) {
        return error;
    }
}

ServerSchema.methods.edit_server_group = function(server_group_index, server_group) {
    try {

        this.server_groups[server_group_index] = server_group;

        return this.save();

    } catch (error) {
        return error;
    }
}  

ServerSchema.methods.remove_server_group = function(server_group_index) {
    try {

        const server_group = this.server_groups[server_group_index];

        this.members.forEach(member => {
            if (member.server_group === server_group._id) {
                member.server_group = this.server_groups[0]._id;
            }
        })

        this.server_groups.splice(server_group_index, 1);

        return this.save();

    } catch(error) {
        return error;
    }
}

ServerSchema.methods.assign_server_group = function(server_group_index, member_index) {
    try {

        this.members[member_index].server_group = this.server_groups[server_group_index]._id;

        return this.save();

    } catch (error) {
        return error;
    }
}



module.exports.ServerSchema = mongoose.model('ServerSchema', ServerSchema);