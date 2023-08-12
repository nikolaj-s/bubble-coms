const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");

const FetchScreenShots = async (socket, data, cb) => {
    try {

        const screenShots = await MessageSchema.find({server_id: socket.current_server, screen_shot: true}).sort({"date": -1}).limit(data.count || 20);

        let shots = screenShots.length < data.count ? [...screenShots, {no_more: true}] : screenShots;

        return cb({screen_shots: shots});

    } catch (error) {
        console.log(error);
        return cb({error: true, errorMessage: "Fatal Error Fetching Screen Shots"})
    }
}

module.exports = FetchScreenShots;