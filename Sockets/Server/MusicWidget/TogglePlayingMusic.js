

const TogglePlayingMusic = async (socket, data, cb, channelList) => {
    try {

        await channelList.get(socket.channel_id).bot.togglePlaying(data.playing);

        cb({success: true})

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "coms error has occurred"})
    }
}

module.exports = TogglePlayingMusic;