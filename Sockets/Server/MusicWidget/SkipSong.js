

const SkipSong = async (socket, data, cb, channelList) => {
    try {

        await channelList.get(socket.channel_id).bot.skipSong();

        cb({success: true})

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error has occurred"})
    }
}

module.exports = SkipSong;