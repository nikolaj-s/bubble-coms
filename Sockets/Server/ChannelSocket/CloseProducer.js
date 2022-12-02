
const CloseProducer = async (socket, data, channelList) => {
    try {
        
        console.log('closing producer', data)
        channelList.get(socket.channel_id).closeProducer(socket.id, data.producer_id);

    } catch (error) {
        
        socket.emit({error: true, errorMessage: "error closing connection"})
    }
}

module.exports = CloseProducer;