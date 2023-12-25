
const fetch = require('node-fetch');

const { v4: uuidv4} = require('uuid');
const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');

const AddSongToQueue = async (socket, data, cb, channelList) => {
    try {

        const channel = channelList.get(socket.channel_id);

        if (!channel) return cb({error: true, errorMessage: "You are not currently in a channel"});

        if (channel.bot.song_queue.length >= 11) return cb({error: true, errorMessage: "Queue limit has been reached"});
        
        const server = await ServerSchema.findOne({_id: socket.current_server})

        if (!server) return cb({error: true, errorMessage: "Validation error"});

        const member = await server.get_member(socket.AUTH.username);

        const server_group = await server.get_server_group(member.server_group);
        
        const channel_index = await server.get_channel(String(socket.channel_id.split('/')[1]));
        
        const auth = server?.channels[channel_index]?.media_auth?.includes(socket.AUTH.username)
       
        if (server.channels[channel_index].locked_media && (server_group.server_group_name !== 'Owner' && server.channels[channel_index]?.channel_owner !== socket.AUTH.username && !auth)) return cb({error: true, errorMessage: "You Are Not Authorized To Perform This Action"});

        const user = await channelList.get(socket.channel_id).return_peer_by_socket_id(socket.id);

        if (user.error) return cb({user});
        
        if (data.song) {

            channel.bot.pushNewSong({...data.song}, user)
        
        } else {

            const query = data.query;

            if (!query || query.length === 0) return cb({error: true, errorMessage: "Query cannot be empty"});
            console.log(query)
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