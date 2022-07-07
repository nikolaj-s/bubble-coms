
const ConnectTransport = async (socket, data, channelList, cb) => {
    try {

        await channelList.get(socket.channel_id).connectPeerTransport(socket.id, data.transport_id, data.dtlsParameters);

        cb({success: true});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "connection error"})
    }
}

module.exports = ConnectTransport;