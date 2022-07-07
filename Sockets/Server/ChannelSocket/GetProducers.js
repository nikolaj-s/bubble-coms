
const GetProducers = async (socket, data, channelList) => {
    try {
        if (!channelList.has(socket.channel_id)) return {error: true, errorMessage: "channel does not exist"};

        let producerList = channelList.get(socket.channel_id).getProducerListForPeer();
        
        socket.emit('newProducers', producerList);

    } catch (error) {
        console.log(error);
        socket.emit('error', {error: true, errorMessage: "error getting producers"});
    }
}

module.exports = GetProducers;