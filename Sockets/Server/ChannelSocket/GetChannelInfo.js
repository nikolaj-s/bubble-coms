

const getChannelInfo = async (socket, data, channelList) => {
    try {

        socket.emit(channelList.get(socket.channel_id).toJson());

    } catch (error) {
        console.log(error);
        socket.emit('error', {error: true, errorMessage: "error fetching channel info"})
    }
}

module.exports = getChannelInfo;