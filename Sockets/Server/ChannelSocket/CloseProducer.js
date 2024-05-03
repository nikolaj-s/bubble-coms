
const CloseProducer = async (socket, data, channelList, cb) => {
    try {
        
        console.log('closing producer', data)
        channelList.get(socket.channel_id).closeProducer(socket.id, data.producer_id);

        return cb({success: "closed"});

    } catch (error) {
        
        socket.emit({error: true, errorMessage: "error closing connection"})
    }
}

module.exports = CloseProducer;