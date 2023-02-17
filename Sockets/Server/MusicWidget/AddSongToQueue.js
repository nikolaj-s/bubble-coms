
const fetch = require('node-fetch');

const { v4: uuidv4} = require('uuid')

const AddSongToQueue = async (socket, data, cb, channelList) => {
    try {

        const channel = channelList.get(socket.channel_id);

        if (!channel) return cb({error: true, errorMessage: "You are not currently in a channel"});

        if (channel.bot.song_queue.length >= 11) return cb({error: true, errorMessage: "Queue limit has been reached"});

        const user = await channelList.get(socket.channel_id).return_peer_by_socket_id(socket.id);

        if (user.error) return cb({user});
        
        if (data.song) {

            channel.bot.pushNewSong({...data.song}, user)
        
        } else {

            const query = data.query;

            if (!query || query.length === 0) return cb({error: true, errorMessage: "Query cannot be empty"});

            const song = await fetch(`https://bubble-music.herokuapp.com/fetch-song-info?query=${query}`)
            .then(response => {
                return response.json();
            })
            .catch(error => {
                console.log(error);
                return {error: true, errorMessage: 'fatal error'}
            })

            if (song.error || !song) return cb({error: true, errorMessage: song.errorMessage});

            channel.bot.pushNewSong({...song, _id: uuidv4(), liked: false}, user)

        }
        cb({success: true});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: 'Fatal Error Finding Song'})
    }
}

module.exports = AddSongToQueue;