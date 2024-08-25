
const mongoose = require('mongoose');

const ChannelSchema = require("../Channel/ChannelSchema");
const MemberSchema = require("../Member/MemberSchema");
const BanSchema = require("../Ban/BanSchema");
const ServerGroupSchema = require('../ServerGroup/ServerGroupSchema');

const { v4: uuidv4} = require('uuid');
const Categories = require('../Categories/Categories');

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
    banned_keywords: [],
    inactive_channel: {
        type: String,
    },
    welcome_message: {
        type: String,
    },
    activity_feed: [],
    image_of_the_day: {},
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
                user_can_create_channels: false,
                user_can_delete_channels: false,
                user_can_create_server_groups: false,
                user_can_delete_server_groups: false,
                user_can_delete_other_users_messages: false,
                user_can_move_users: false,
                user_can_manage_server_safe_search: false
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
            user_can_create_channels: true,
            user_can_delete_channels: true,
            user_can_create_server_groups: true,
            user_can_delete_server_groups: true,
            user_can_delete_other_users_messages: true,
            user_can_move_users: true,
            user_can_manage_server_safe_search: true,
        }]
    },
    server_owner: {
        type: String,
        required: true
    },
    pinned_messages: [],
    recent_image_searches: [],
    times_media_searched: {
        type: Number,
        default: 0
    },
    pinned_sub_reddits: [],
    categories: [Categories],
    recent_videos: [],
    disable_safe_search: {
        type: Boolean,
        default: false
    }
})

ServerSchema.methods.update_safe_search_state = function(bool) {
    this.disable_safe_search = bool;

    return this.save();
}

ServerSchema.methods.update_pinned_sub_reddits = function(sub_reddits) {
    this.pinned_sub_reddits = sub_reddits;

    return this.save();
}

ServerSchema.methods.update_inactive_channel = function(channel_id) {
    this.inactive_channel = channel_id;

    return this.save();
}

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

ServerSchema.methods.update_last_online_state = function(username) {
    const index = this.members.findIndex(m => m.username === username);

    if (index === -1) return;

    this.members[index].last_online = Date.now();

    return this.save();
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
ServerSchema.methods.re_organize_channels = function(new_order, category, channel_id) {
    try {

        const channel = this.channels.findIndex(c => String(c._id) === channel_id);
        console.log(channel)
        if (channel !== -1) {
            this.channels = this.channels.map(c => {
                if (String(c._id) === channel_id) {
                    return {...c, category: category}
                } else {
                    return c;
                }
            })
        }

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
        
        this.channels[channel_index].last_message_id = message._id;

        return this.save();

    } catch (error) {
        return error;
    }

}

ServerSchema.methods.delete_message = function(channel_id, message_id) {
    try {

        const channel = this.channels.findIndex(c => String(c._id) === String(channel_id));

        if (channel === -1) return;

        this.channels[channel].last_message_id = message_id;

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

        this.channels[channel].last_message_id = "";

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

ServerSchema.methods.update_channel = function(channel_id, channel, status) {
    try {

        const c_index = this.channels.findIndex(c => String(c._id) === channel_id);
        
        if (c_index === -1) return {error: true}

        this.channels = this.channels.map(c => {
            if (String(c._id) === channel_id) {
                return {...c, channel_name: channel.channel_name, persist_social: channel.persist_social, widgets: channel.widgets, channel_background: channel?.channel_background ? channel.channel_background : c?.channel_background, background_blur: channel.background_blur, disable_streams: channel.disable_streams, auth_users: channel.auth_users, locked_channel: channel.locked_channel, icon: channel?.icon ? channel?.icon : c?.icon, channel_owner: channel.channel_owner, locked_media: channel.locked_media, media_auth: channel.media_auth, contain_background: channel.contain_background, block_nsfw_posting: channel.block_nsfw_posting, guidelines: channel.guidelines}
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

ServerSchema.methods.update_search_times = function() {
    this.times_media_searched++;

    return this.save();
}

ServerSchema.methods.update_recent_image_searches = function(arr) {
    try {

        let shuffled = arr
        .map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value);


        this.recent_image_searches = shuffled;

        this.times_media_searched = 0;

        return this.save();

    } catch (error) {
        return error;
    }
}

ServerSchema.methods.update_recent_videos = function(arr) {
    try {
        let shuffled = arr
        .map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value);

        this.recent_videos = shuffled;

        this.times_media_searched = 0;

        return this.save();
    } catch (er) {
        return;
    }
}


ServerSchema.methods.clear_image_search_data = function() {
    try {

        this.recent_image_searches = [];

        this.recent_videos = [];

        this.image_of_the_day = {};

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

ServerSchema.methods.update_image_of_the_day = function(media_to_pick_from = []) {

    if (media_to_pick_from.length === 0 && !this.image_of_the_day?.date) return {};

    if (media_to_pick_from.length === 0) return {};

    const random = Math.floor(Math.random() * media_to_pick_from.length);

    const media = {date: Date.now(), ...media_to_pick_from[random]}

    if (!this.image_of_the_day?.date) {
        
        this.image_of_the_day = media;
        
        this.save();
    } else if (this.image_of_the_day?.date) {

        let data = Math.floor(((Date.now() - this.image_of_the_day?.date) / 1000) / 60);
        
        if (data >= 1440) {

            this.image_of_the_day = media;

            this.save();
    
        }

    }

    return this.image_of_the_day;
}

ServerSchema.methods.update_activity_feed = function(data) {
    
    let updated_status_arr = this.activity_feed;
    
    if (updated_status_arr.length >= 30) updated_status_arr.pop();

    const new_activity_message = {_id: uuidv4(), ...data};

    this.activity_feed = [new_activity_message, ...updated_status_arr];

    return this.save();

}

ServerSchema.methods.clear_activity_feed = function() {
    this.activity_feed = [];

    return this.save();
}

ServerSchema.methods.update_welcome_message = function(data) {
    this.welcome_message = data;

    return this.save();
}

ServerSchema.methods.update_banned_keywords = function(data) {
    this.banned_keywords = data;

    return this.save();
}

ServerSchema.methods.add_category = function(data) {
    this.categories.push(data);

    return this.save();
}

ServerSchema.methods.delete_category = function(categroy_id) {
    this.categories = this.categories.filter(c => String(c._id) !== String(categroy_id));

    this.channels = this.channels.map(c => {
        if (String(c.category) === String(categroy_id)) {
            return {...c, category: 'channels'}
        } else {
            return c;
        }
    })

    return this.save();
}

ServerSchema.methods.re_order_categories = function(new_order) {
    
    this.categories.sort((a, b) => {
        return new_order.indexOf(String(a._id)) - new_order.indexOf(String(b._id));
    })

    return this.save();
}

module.exports.ServerSchema = mongoose.model('ServerSchema', ServerSchema);