
const fetch = require('node-fetch');

const AddSongToQueue = async (socket, data, cb, channelList) => {
    try {

        const channel = channelList.get(socket.channel_id);

        if (!channel) return cb({error: true, errorMessage: "You are not currently in a channel"});

        const query = data.query;

        if (!query || query.length === 0) return cb({error: true, errorMessage: "Query cannot be empty"});

        const song = await fetch(`http://127.0.0.1:8000/fetch-song-info?query=${query}`)
        .then(response => {
            return response.json();
        })
        .catch(error => {
            console.log(error);
            return {error: true, errorMessage: 'fatal error'}
        })

        if (song.error || !song) return cb({error: true, errorMessage: song.errorMessage});

        channel.bot.pushNewSong(song)

        cb({success: true});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: 'Fatal Error Finding Song'})
    }
}

module.exports = AddSongToQueue;