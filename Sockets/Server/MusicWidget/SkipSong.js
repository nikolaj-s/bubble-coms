const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const SkipSong = async (socket, data, cb, channelList) => {
    try {

        const user = await channelList.get(socket.channel_id).return_peer_by_socket_id(socket.id);

        const server = await ServerSchema.findOne({_id: socket.current_server})

        if (!server) return cb({error: true, errorMessage: "Validation error"});

        const member = await server.get_member(socket.AUTH.username);

        const server_group = await server.get_server_group(member.server_group);
        
        const channel = await server.get_channel(String(socket.channel_id.split('/')[1]));
        
        const auth = server?.channels[channel]?.media_auth?.includes(socket.AUTH.username)
       
        if (server.channels[channel].locked_media && (server_group.server_group_name !== 'Owner' && server.channels[channel]?.channel_owner !== socket.AUTH.username && !auth)) return cb({error: true, errorMessage: "You Are Not Authorized To Perform This Action"});

        if (user.error) return cb({user});

        await channelList.get(socket.channel_id).bot.skipSong(user);

        cb({success: true})

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error has occurred"})
    }
}

module.exports = SkipSong;