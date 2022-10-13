
const Produce = async (socket, data, channelList, cb) => {
    try {
        
        console.log(socket.channel_id)

        const producer_id = await channelList.get(socket.channel_id).produce(socket.id, data.producerTransportId, data.rtpParameters, data.kind);

        cb(producer_id);

    } catch (error) {
        console.log(error);
        socket.emit('error', {error: true, errorMessage: "error sending data"})
    }
}

module.exports = Produce;