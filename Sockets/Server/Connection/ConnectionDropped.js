const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const ConnectionDropped = async (socket, data, channelList, serverList) => {
    try {  

        if (socket.channel_id) {
            
            await channelList.get(socket.channel_id)?.removePeer(socket.id);

            if (channelList.get(socket.channel_id)?.getPeers().size === 0) await channelList.delete(socket.channel_id)

            socket.to(socket.current_server).emit("user dropped connection", {id: socket.channel_id.split('/')[1], username: socket.AUTH.username});
        
        }
        const user = await AccountSchema.findOne({_id: socket.AUTH._id});

        if (!user) return cb({error: true, errorMessage: "validation error"});

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "server does not exist"});

        const memberFile = await server.get_member(user.username);

        if (memberFile === -1 || memberFile.error) return cb({error: true, errorMessage: "You are not a member of this server"});

        serverList.get(socket.current_server).user_leaves_server(String(memberFile._id));

        if (serverList.get(socket.current_server).users.size === 0) {

            serverList.delete(socket.current_server);
        
        }

        socket.to(socket.current_server).emit('left server', {member_id: String(memberFile._id)})

        socket.leave(socket.channel_id);

        socket.leave(socket.current_server);

        socket.disconnect();

        socket.channel_id = null;

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