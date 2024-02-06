const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const SearchYoutube = require("../../../Util/Youtube/SearchYoutube");

const SearchMedia = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Validation error"});

        const query = data.query;

        if (query.length === 0) return cb({error: true, errorMessage: "Cannot Search An Empty Query"});

        const results = await SearchYoutube(query);

        if (results.error) return cb(results);

        return cb(results);

    } catch (error) {
        return cb({error: true, errorMessage: error.message});
    }
}

module.exports = SearchMedia;