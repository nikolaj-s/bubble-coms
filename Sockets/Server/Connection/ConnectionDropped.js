const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const ConnectionDropped = async (socket, data, channelList, serverList) => {
    try {  

        console.log("User has lost connection");

        if (socket.channel_id) {
            
            await channelList.get(socket.channel_id)?.removePeer(socket.id);

            if (channelList.get(socket.channel_id)?.getPeers().size === 0) channelList.get(socket.channel_id)?.cleanUp();

            if (channelList.get(socket.channel_id)?.getPeers().size === 0) await channelList.delete(socket.channel_id)

            socket.to(socket.current_server).emit("user dropped connection", {id: socket.channel_id.split('/')[1], username: socket.AUTH.username});
        
        }
        
        const memberFile = serverList.get(socket.current_server).get_user_by_socket_id(socket.id);

        serverList.get(socket.current_server).user_leaves_server(socket.id);

        if (serverList.get(socket.current_server).users.size === 0) {

            serverList.delete(socket.current_server);
        
        }

        const server = await ServerSchema.findOne({_id: socket.current_server});

        await server.update_last_online_state(socket.AUTH.username);

        socket.to(socket.current_server).emit('left server', {member_id: String(memberFile._id), last_online: Date.now()})

        socket.leave(socket.channel_id);

        socket.leave(socket.current_server);

        socket.disconnect();

        socket.channel_id = null;
        
    } catch (error) {
        socket.leave(socket.channel_id);

        socket.leave(socket.current_server);
        
        socket.disconnect();

        socket.channel_id = null;

        socket.channel_id = null;
        console.log(error);
    }
}

module.exports = ConnectionDropped;