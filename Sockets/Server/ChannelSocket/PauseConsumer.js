

const PauseConsumer = async (socket, data, cb, channelList) => {
    try {

        const channel = channelList.get(socket.channel_id);

        if (!channel) return cb({error: true, errorMessage: "You are not currently in a channel"});

        await channel.pauseConsumer(socket.id, data.consumerId);

        cb({success: true});

        return;
        
    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: error.message})
    }
}

module.exports = PauseConsumer;