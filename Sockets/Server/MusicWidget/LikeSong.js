const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const LikeSong = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Validation Error"});

        const song = {...data.song, liked: true};

        await server.like_song(data.channel_id, song);

        cb({success: true, song: song, channel_id: data.channel_id});

        socket.to(socket.current_server).emit('liked song', {song: song, channel_id: data.channel_id});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: error.message});
    }
}

module.exports = LikeSong;