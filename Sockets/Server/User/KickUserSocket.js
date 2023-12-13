const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");
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
        
        const user_to_kick_file = await server.get_member(data.username);        

        await server.update_member({...user_to_kick_file, _id: String(user_to_kick_file._id), server_score: (user_to_kick_file.server_score - 5)})

        const status_msg = await MessageSchema({
            channel_id: String(server._id),
            content: {
                text: `Kicked ${user_to_kick_file?.display_name} from the server`,
                date: new Date,
                time: Date.now()
            },
            pinned: false,
            username: socket.AUTH.username,
            server_id: String(server._id),
            status: true
        }).save();

        socket.to(user_to_kick).emit('kick', {kicked_by: member.display_name});

        socket.to(socket.current_server).emit('server status', status_msg);

        cb(status_msg);

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error kicking user"});
    }
}

module.exports = KickUserSocket;