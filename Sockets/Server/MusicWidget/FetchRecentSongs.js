const { SongSchema } = require("../../../Schemas/Song/SongSchema");

const FetchRecentSongs = async (socket, data, cb) => {
    try {

        const songs = await SongSchema.find({server_id: socket.current_server}).sort({"date": -1}).limit(20);

        cb({songs: songs});

    } catch (error) {
        console.log(error);

        cb({error: true, errorMessage: "Fatal Error Fetching Recent Media"})
    }
}

module.exports = FetchRecentSongs;