
const CreateWebRtcTransport = async (socket, data, channelList, cb) => {
    try {
        const { params } = await channelList.get(socket.channel_id).createWebRtcTransport(socket.id);

        cb(params);

    } catch (error) {
        console.log(error);
        socket.emit({error: true, errorMessage: "error fetching channel details"})
    }
}

module.exports = CreateWebRtcTransport;