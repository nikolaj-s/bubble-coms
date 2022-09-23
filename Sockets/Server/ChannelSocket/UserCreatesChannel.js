
const mongoose = require('mongoose');

const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const UserCreatesChannel = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: mongoose.Types.ObjectId(data.server_id)})

        if (server.channels.length > 11) return cb({error: true, errorMessage: "You have reached your servers channel limit of 12"})
        
        if (!server) return socket.emit({error: true, errorMessage: "validation error"});
        
        if (data.channel_name.length < 4) return cb({error: true, errorMessage: "Channel Name Cannot Be less than 4 characters long"});

        if (data.channel_name.includes('/')) return cb({error: true, errorMessage: "Channel Name Cannot Include A Forward Slash"});

        // validate users permissions
        const user = await server.get_member(socket.AUTH.username);

        if (user === -1) return socket.emit('error', {error: true, errorMessage: "validation error"});

        const server_group = await server.get_server_group(user.server_group)

        if (server_group === -1) return socket.emit('error', {error: true, errorMessage: "validation error"});

        if (server_group.user_can_manage_channels === false) return socket.emit('error', {error: true, errorMessage: "you do not have permissions to perform this action"})

        const channel_data = {
            channel_name: data.channel_name,
            persist_social: data.persist_social
        }

        await server.create_channel(channel_data);

        await server.save();

        cb(server.channels[server.channels.length - 1])

        socket.to(data.server_id).emit('new channel', server.channels[server.channels.length - 1]);

    } catch (error) {
        console.log(error);
        socket.emit('error', {error: true, errorMessage: "Fatal Server Error"});
    }
}

module.exports = UserCreatesChannel;