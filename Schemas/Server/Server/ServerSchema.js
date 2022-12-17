
const mongoose = require('mongoose');

const ChannelSchema = require("../Channel/ChannelSchema");
const MemberSchema = require("../Member/MemberSchema");
const BanSchema = require("../Ban/BanSchema");
const ServerGroupSchema = require('../ServerGroup/ServerGroupSchema');
const WidgetSchema = require('../Widget/WidgetSchema');

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
                user_can_view_channel_content: false,
                user_can_post_channel_social: false,
                user_can_manage_channels: false,
                user_can_manage_server_groups: false,
                user_can_kick_user: false,
                user_can_ban_user: false,
                user_can_edit_server_banner: false,
                user_can_edit_server_name: false,
                user_can_edit_server_password: false,
            }, {
            server_group_name: "Owner",
            user_can_view_channel_content: true,
            user_can_post_channel_social: true,
            user_can_manage_channels: true,
            user_can_manage_server_groups: true,
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
    },
    pinned_messages: [],
    recent_image_searches: []
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

ServerSchema.methods.update_member = function(user) {
    try {

        this.members = this.members.map(member => {
            if (String(member._id) === String(user._id)) {
                return {...member, ...user}
            } else {
                return member;
            }
        })

        return this.save();

    } catch (error) {
        return error;
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

ServerSchema.methods.un_ban_user = function(id) {
    try {

        this.ban_list = this.ban_list.filter(ban => String(ban._id) !== String(id));

        return this.save();

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.ban_user = function(member_id, username) {
    try {

        this.members = this.members.filter(m => String(m._id) !== String(member_id));

        this.ban_list.push({username: username});

        this.save();

        return this.ban_list[this.ban_list.length - 1];

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

ServerSchema.methods.update_server_password = function(password) {
    this.server_password = password;
    
    return this.save();
}

// verify user's permissions
ServerSchema.methods.verify_user_group = function(member_index, action) {

    const server_group = this.members[member_index].server_group;

    const server_group_index = this.server_groups.findIndex(el => {el._id === server_group});

    return this.server_groups[server_group_index][action]

}

// channel methods
ServerSchema.methods.re_organize_channels = function(new_order) {
    try {

        this.channels.sort((a, b) => {
            return new_order.indexOf(String(a._id)) - new_order.indexOf(String(b._id));
        })

        return this.save();

    } catch (error) {
        console.log(error)
        return error;
    }
}

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
        
        const channel_index = this.channels.findIndex(el => String(el._id) === channel_id)

        return channel_index;

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.delete_channel = function(channel_id) {
    try {

        const updated_channels = this.channels.filter(channel => String(channel._id) !== String(channel_id));

        this.channels = updated_channels;

        return this.save();

    } catch (error) {
        console.log(error)
        return {error: true}
    }
}

ServerSchema.methods.save_message = function(channel_index, message) {
    try {

        this.channels[channel_index].social.unshift(message);

        return this.save();

    } catch (error) {
        return error;
    }

}

ServerSchema.methods.delete_message = function(channel_id, message_id) {
    try {

        const channel = this.channels.findIndex(c => String(c._id) === String(channel_id));

        if (channel === -1) return;

        this.channels[channel].social = this.channels[channel].social.filter(m => String(m._id) !== String(message_id));

        return this.save();

    } catch (error) {
        console.log(error)
    }
}

ServerSchema.methods.clear_social = function(channel_id) {
    try {

        const channel = this.channels.findIndex(c => String(c._id) === String(channel_id));

        if (channel === -1) return;

        this.channels[channel].social = [];

        return this.save();

    } catch (error) {
        console.log(error)
    }
}

ServerSchema.methods.trim_social = function(channel_index) {
    try {

        const last_social = this.channels[channel_index].social.pop();

        if (last_social.pinned) {
            this.pinned_messages.filter(m => m._id !== last_social._id);
        }
        
        this.save();

        return last_social;
    } catch (error) {
        return error
    }
}

ServerSchema.methods.add_widget_to_channel = function(channel_index, widget) {
    try {

        this.channels[channel_index].widgets.push(widget);

        this.save();

        return this.channels[channel_index].widgets[this.channels[channel_index].widgets.length - 1];
        
    } catch (error) {
        return error;
    }
}

ServerSchema.methods.update_channel = function(channel_id, channel) {
    try {

        const c_index = this.channels.findIndex(c => String(c._id) === channel_id);
        
        if (c_index === -1) return {error: true}

        this.channels = this.channels.map(c => {
            if (String(c._id) === channel_id) {
                return {...c, channel_name: channel.channel_name, persist_social: channel.persist_social, widgets: channel.widgets, channel_background: channel?.channel_background ? channel.channel_background : c?.channel_background, background_blur: channel.background_blur}
            } else {
                return c;
            }
        })

        this.save();

        return this.channels[c_index];

    } catch (error) {
        console.log(error)
        return {error: true}
    }
}

// server groups
ServerSchema.methods.update_server_groups = function(server_groups) {
    try {

        this.server_groups = server_groups;

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

ServerSchema.methods.assign_server_group = function(server_group, username) {
    try {

        const index = this.members.findIndex(member => member.username === username)

        this.members[index].server_group = server_group;

        return this.save();

    } catch (error) {
        return error;
    }
}

// pinned messages
ServerSchema.methods.add_pinned_message = function (message) {
    try {

        const c_index = this.channels.findIndex(c => String(c._id) === message.channel_id);

        if (this.channels[c_index].persist_social === false) return;
        
        this.channels = this.channels.map(c => {
            if (String(c._id) === message.channel_id) {
                return {...c, social: c.social.map(m => {
                    if (m._id === message._id) {
                        return {...m, pinned: true}
                    } else {
                        return m;
                    }
                })}
            } else {
                return c;
            }
        })

        this.pinned_messages.unshift(message);

        return this.save()

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.remove_pinned_message = function(message) {
    try {

        this.channels = this.channels.map(c => {
            if (String(c._id) === message.channel_id) {
                return {...c, social: c.social.map(m => {
                    if (m._id === message._id) {
                        return {...m, pinned: false}
                    } else {
                        return m;
                    }
                })}
            } else {
                return c;
            }
        })
        
        this.pinned_messages = this.pinned_messages.filter(m => String(m._id) !== message._id);

        return this.save();

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.delete_pinned_message = function(id) {
    try {
        this.pinned_messages = this.pinned_messages.filter(m => String(m._id) !== id);

        return this.save();
    } catch (error) {
        return error;
    }
}

ServerSchema.methods.update_recent_image_searches = function(arr) {
    try {

        const current_images = this.recent_image_searches;

        if (current_images.length >= 15) {
            current_images.splice(0, 3)
        }

        this.recent_image_searches = [...current_images, ...arr];

        return this.save();

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.clear_image_search_data = function() {
    try {

        this.recent_image_searches = [];

        return this.save();
        
    } catch (error) {
        return error;
    }
}

// music widgets

ServerSchema.methods.like_song = function(channel_id, song) {

    this.channels = this.channels.map(channel => {
        if (String(channel._id) === String(channel_id)) {
            return {...channel, widgets: channel.widgets.map(widget => {
                if (widget.type === 'music') {
                    console.log(widget, song)
                    return {...widget, content: {...widget.content, liked_songs: [...widget.content.liked_songs, song]}}
                } else{
                    return widget;
                }
            })}
        } else {
            return channel;
        }
    })

    return this.save();

}

ServerSchema.methods.un_like_song = function(channel_id, song) {

    this.channels = this.channels.map(channel => {
        if (String(channel._id) === String(channel_id)) {
            return {...channel, widgets: channel.widgets.map(widget => {
                if (widget.type === 'music') {

                    return {...widget, content: {...widget.content, liked_songs: widget.content.liked_songs.filter(s => s._id !== song._id)}}

                } else {
                    return widget;
                }
            })}
        } else {
            return channel;
        }
    })

    return this.save();
}

module.exports.ServerSchema = mongoose.model('ServerSchema', ServerSchema);