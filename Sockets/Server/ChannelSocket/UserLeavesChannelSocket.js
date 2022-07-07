const UserJoinsChannelSocket = require("./UserJoinsChannelSocket");


const UserLeavesChannel = async (socket, data, channelList, cb) => {
    try {

        await channelList.get(socket.channel_id).removePeer(socket.id);

        const channel_id = socket.channel_id.split('/')[1]
        
        socket.to(socket.current_server).emit('user leaves channel', {id: channel_id, username: socket.AUTH.username});

        socket.leave(socket.channel_id);

        if (channelList.get(socket.channel_id).getPeers().size === 0) await channelList.delete(socket.channel_id);

        socket.channel_id = null;

        cb({success: "left channel"})

    } catch (error) {
        console.log(error);
        socket.emit('error', {error: true, errorMessage: "error disconnecting from chanel"})
    }
}

module.exports = UserLeavesChannel;