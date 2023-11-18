const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const UserLeavesServer = async (socket, data, channelList, serverList, cb = () => {}) => {
    try {

        if (!socket.current_server) return cb({success: true});

        if (socket.channel_id) {
            
            await channelList.get(socket.channel_id)?.removePeer(socket.id);

            const channel_id = socket.channel_id.split('/')[1]
            
            socket.to(socket.current_server).emit('user leaves channel', {id: channel_id, username: socket.AUTH.username, reason: data});
    
            socket.leave(socket.channel_id);
    
            if (channelList.get(socket.channel_id)?.getPeers()?.size === 0) {
    
                await channelList.get(socket.channel_id).cleanUp();
    
                await channelList.delete(socket.channel_id);
            }
        }
        
        if (socket.current_server) {
            
            try { 
                
                const memberFile = serverList.get(socket.current_server)?.get_user_by_socket_id(socket.id);

                socket.to(socket.current_server).emit('left server', {member_id: String(memberFile?._id), last_online: Date.now(), reason: data});

                serverList.get(socket.current_server)?.user_leaves_server(socket.id);

                if (serverList.get(socket.current_server)?.users?.size === 0) {

                    serverList.delete(socket.current_server);
                
                }

            } catch (error) {
                console.log(error)
                return;
            }
        
        }

        cb({success: true})

        if (!socket.current_server) return;

        socket.leave(socket.current_server);

        console.log('user has disconnected this is getting called from userLeavesServer.js');

        const server = await ServerSchema.findOne({_id: socket.current_server});

        await server.update_last_online_state(socket.AUTH.username);

        socket.disconnect();

    } catch(error) {

        console.log(error);

        cb({success: true})

        if (socket.channel_id) {

            socket.leave(socket.channel_id);

        }

        socket.leave(socket.current_server)

        socket.disconnect();
    }
}

module.exports = UserLeavesServer;