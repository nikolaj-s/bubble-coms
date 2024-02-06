
const { v4: uuidv4} = require('uuid');
const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');
const FetchYoutubeVideo = require('../../../Util/Youtube/Youtube');
const { SongSchema } = require('../../../Schemas/Song/SongSchema');
const { MessageSchema } = require('../../../Schemas/Message/MessageSchema');

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

        let song;

        if (user.error) return cb({user});
        
        if (data.song) {

            song = data.song;

            channel.bot.pushNewSong({...data.song}, user)
        
        } else {

            const query = data.query;

            if (!query || query.length === 0) return cb({error: true, errorMessage: "Query cannot be empty"});
            
            song = await FetchYoutubeVideo(query);

            console.log(song)

            if (song.error || !song) return cb({error: true, errorMessage: song.message});

            channel.bot.pushNewSong({...song, _id: uuidv4(), liked: false}, user)
            
        }

        let exists = await SongSchema.findOne({id: song.id});

        if (!exists) {
            
            await new SongSchema({...song, server_id: socket.current_server}).save();      
        
        }

        let media_history_channel;

        for (const c of server.channels) {
            if (c.type === 'mediahistory') {
                media_history_channel = c;
                break;
            }
        }

        if (media_history_channel) {
            const log_message = {
                content: {
                    time: Date.now(),
                    date: new Date,
                    text: `Added:`,
                    song: song
                },
                server_id: socket.current_server,
                channel_id: String(media_history_channel._id),
                pinned: false,
                username: socket.AUTH.username,
                song: true
            }
            console.log(log_message)
            await new MessageSchema(log_message).save();
        }

        cb({success: true});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: 'Fatal Error Finding Song'})
    }
}

module.exports = AddSongToQueue;