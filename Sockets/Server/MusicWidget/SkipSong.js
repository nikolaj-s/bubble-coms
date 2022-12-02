

const SkipSong = async (socket, data, cb, channelList) => {
    try {

        const user = await channelList.get(socket.channel_id).return_peer_by_socket_id(socket.id);

        if (user.error) return cb({user});

        await channelList.get(socket.channel_id).bot.skipSong(user);

        cb({success: true})

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error has occurred"})
    }
}

module.exports = SkipSong;