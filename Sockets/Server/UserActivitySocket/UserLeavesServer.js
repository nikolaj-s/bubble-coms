const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const UserLeavesServer = async (socket, data, channelList, serverList, cb) => {
    try {

        if (socket.channel_id) {
            
            await channelList.get(socket.channel_id)?.removePeer(socket.id);

            const channel_id = socket.channel_id.split('/')[1]
            
            socket.to(socket.current_server).emit('user leaves channel', {id: channel_id, username: socket.AUTH.username});
    
            socket.leave(socket.channel_id);
    
            if (channelList.get(socket.channel_id).getPeers().size === 0) {
    
                await channelList.get(socket.channel_id).cleanUp();
    
                await channelList.delete(socket.channel_id);
            }
        }

        const user = await AccountSchema.findOne({_id: socket.AUTH._id});

        const server = await ServerSchema.findOne({_id: socket.current_server});

        const memberFile = await server.get_member(user.username);

        serverList.get(socket.current_server).user_leaves_server(String(memberFile._id));

        if (serverList.get(socket.current_server).users.size === 0) {

            serverList.delete(socket.current_server);
        
        }

        socket.to(socket.current_server).emit('left server', {member_id: String(memberFile._id)})

        socket.leave(socket.current_server);

        socket.disconnect();

        console.log('user has disconnected');

    } catch(error) {

        console.log(error);

        console.log("cleaning up diso")

        if (socket.channel_id) {

            socket.leave(socket.channel_id);

        }

        socket.leave(socket.current_server)

        socket.disconnect();
    }
}

module.exports = UserLeavesServer;