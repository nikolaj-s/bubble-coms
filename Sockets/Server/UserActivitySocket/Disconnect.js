

const Disconnect = async (socket, data, channelList, cb) => {
    try {  

        if (socket.channel_id) {
            
            await channelList.get(socket.channel_id)?.removePeer(socket.id);

            if (channelList.get(socket.channel_id)?.getPeers().size === 0) channelList.get(socket.channel_id)?.cleanUp();

            if (channelList.get(socket.channel_id)?.getPeers().size === 0) await channelList.delete(socket.channel_id)

            socket.to(socket.current_server).emit("user leaves channel", {id: socket.channel_id.split('/')[1], username: socket.AUTH.username});
        }
        
        socket.leave(socket.channel_id);

        socket.channel_id = null;
        
    } catch (error) {
        console.log(error);
    }
}

module.exports = Disconnect;

