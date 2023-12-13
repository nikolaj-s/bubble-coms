
const mongoose = require('mongoose');

const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const { MessageSchema } = require('../../../Schemas/Message/MessageSchema');

const UserCreatesChannel = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: mongoose.Types.ObjectId(data.server_id)})

        if (server.channels.length > 20) return cb({error: true, errorMessage: "You have reached your servers channel limit of 12"})
        
        if (!server) return socket.emit({error: true, errorMessage: "validation error"});
        
        if (data.channel_name.length < 3) return cb({error: true, errorMessage: "Channel Name Cannot Be less than 3 characters long"});

        if (data.channel_name.length > 128) return cb({error: true, errorMessage: "Channel name cannot be longer than 128 characters"});

        if (data.channel_name.includes('/')) return cb({error: true, errorMessage: "Channel Name Cannot Include A Forward Slash"});

        // validate users permissions
        const user = await server.get_member(socket.AUTH.username);

        if (user === -1) return socket.emit('error', {error: true, errorMessage: "validation error"});

        const server_group = await server.get_server_group(user.server_group)

        if (server_group === -1) return socket.emit('error', {error: true, errorMessage: "validation error"});

        if (server_group.user_can_manage_channels === false) return socket.emit('error', {error: true, errorMessage: "you do not have permissions to perform this action"})

        let auth_users;

        const server_owner = server.members.find(u => u.username === server.server_owner);
            
        auth_users = [...data.auth_users, String(server_owner._id), String(user._id === server_owner._id ? "" : user._id)];

        const channel_data = {
            channel_name: data.channel_name,
            persist_social: true,
            auth_users: auth_users,
            locked_channel: data.locked_channel,
            text_only: data.text_only,
            channel_owner: user.username
        }

        const status_message = await new MessageSchema({
            channel_id: String(server._id),
            content: {
                text: `Created a new ${data.text_only ? 'text only' : 'voice'} channel called ${data.channel_name}`,
                date: new Date,
                time: Date.now(),
            },
            pinned: false,
            username: socket.AUTH.username,
            server_id: String(server._id),
            status: true
        }).save();

        await server.create_channel(channel_data);

        await server.save();

        cb({channel: server.channels[server.channels.length - 1], status_msg: status_message});

        socket.to(data.server_id).emit('new channel', {channel: server.channels[server.channels.length - 1], status_msg: status_message});

    } catch (error) {
        console.log(error);
        socket.emit('error', {error: true, errorMessage: "Fatal Server Error"});
    }
}

module.exports = UserCreatesChannel;