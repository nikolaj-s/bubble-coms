const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const KickUserSocket = async (socket, data, cb, channelList) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Fatal verfication error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "unauthorized activity"});

        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_kick_user) return cb({error: true, errorMessage: "unauthorized activity"});

        const user_to_kick = await channelList.get(`${socket.current_server}/${data.channel_id}`).getPeersSocketByUsername(data.username);

        if (!user_to_kick) return cb({error: true, errorMessage: "error kicking user"});

        socket.to(user_to_kick).emit('kick');

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error kicking user"});
    }
}

module.exports = KickUserSocket;