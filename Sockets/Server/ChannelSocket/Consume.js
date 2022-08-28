
const Consume = async (socket, data, channelList, cb) => {
    try {

        const params = await channelList.get(socket.channel_id).consume(socket.id, data.consumerTransportId, data.producerId, data.rtpCapabilities);
        console.log(params)
        cb(params);

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "connection error"})
    }
}


module.exports = Consume;