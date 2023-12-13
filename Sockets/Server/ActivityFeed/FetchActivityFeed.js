const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");


const FetchActivityFeed = async (socket, cb) => {
    try {

        const data = await MessageSchema.find({server_id: socket.current_server, status: true}).sort({"date": -1}).limit(30);

        cb({activity_feed: data.length === 0 ? [{no_status: true}] : data});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: 'Fatal Error Fetching Activity Feed'})
    }
}

module.exports = FetchActivityFeed;