
const GetRouterRtpCapabilities = async (socket, data, channelList, cb) => {
    try {
        
        if (!channelList.get(socket.channel_id)) return cb({error: true, errorMessage: "error fetching details"});
        
        const capabilities = channelList.get(socket.channel_id).getRtpCapabilities();
        
        cb(capabilities);

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "error fetching channel details"})
    }
}

module.exports = GetRouterRtpCapabilities;