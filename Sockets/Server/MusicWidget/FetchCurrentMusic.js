

const FetchCurrentMusic = async (socket, data, cb, channelList) => {
    try {

        const song_data = await channelList.get(socket.channel_id).bot.returnCurrentMusicInfo();
        
        cb({success: true, music_info: song_data})

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "error fetching music information"})
    }
}

module.exports = FetchCurrentMusic;