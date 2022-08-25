

const UserLeavesServer = async (socket, data, channelList) => {
    try {

        if (socket.channel_id) {
            
            await channelList.get(socket.channel_id).removePeer(socket.id);

            const channel_id = socket.channel_id.split('/')[1]
            
            socket.to(socket.current_server).emit('user leaves channel', {id: channel_id, username: socket.AUTH.username});
    
            socket.leave(socket.channel_id);
    
            if (channelList.get(socket.channel_id).getPeers().size === 0) {
    
                await channelList.get(socket.channel_id).cleanUp();
    
                await channelList.delete(socket.channel_id);
            }
        }

        socket.leave(data.server_id);

        socket.emit({success: true, message: "Successfully left server"});

        socket.disconnect();

        console.log('user has disconnected')

    } catch(error) {
        console.log(error);
        return {error: true, errorMessage: "server error"}
    }
}

module.exports = UserLeavesServer;