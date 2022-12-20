

const RemoveSongFromQueue = async (socket, data, cb, channelList) => {
    try {

        const channel = channelList.get(socket.channel_id);

        if (!channel) return cb({error: true, errorMessage: "You are not currently in a channel"});

        const user = channel.return_peer_by_socket_id(socket.id);

        channel.bot.removeSongFromQueue(data.song, user);

        cb({success: true});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: error.message});
    }
}

module.exports = RemoveSongFromQueue;