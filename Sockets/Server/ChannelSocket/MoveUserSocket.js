const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const MoveUserSocket = async (socket, data, channelList, cb) => {
    try {
        
        const server = await ServerSchema.findOne({_id: socket.current_server})
        
        if (!server) return cb({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(socket.AUTH.username);
        
        if (member === -1) return cb({error: true, errorMessage: "unauthorized activity"});

        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_move_users) return cb({error: true, errorMessage: "ERROR: you lack the required permissions to move other users."});
        
        const user_to_move = await channelList.get(`${socket.current_server}/${data.channel_id}`).getPeersSocketByUsername(data.username);

        if (!user_to_move) return cb({error: true, errorMessage: "error moving user"});

        socket.to(user_to_move).emit('move user', {new_channel: data.to_move});

        cb({success: true});
    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: 'fatal error moving user'})
    }
}

module.exports = MoveUserSocket;