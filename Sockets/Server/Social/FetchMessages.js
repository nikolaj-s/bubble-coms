const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");

const FetchMessages = async (socket, data, cb) => {
    try {

        let d;

        let nsfw;
        
        if (data.type === 'screenshots') {
            d = await MessageSchema.find({screen_shot: true, server_id: socket.current_server}).sort({"date": -1}).limit(data.count);
        } else if (data.type === 'mediahistory') {
            d = await MessageSchema.find({song: true, server_id: socket.current_server}).sort({"date": -1}).limit(data.count);
        } else {
            d = await MessageSchema.find({channel_id: data.channel_id}).sort({"date": -1}).limit(data.count);
            nsfw = await MessageSchema.findOne({channel_id: data.channel_id, nsfw: true});
        }

        let messages = d.length < data.count ? [...d, {no_more_messages: true}] : d;

        cb({messages: messages, channel_id: data.channel_id, nsfw_notice: nsfw ? true : false});

    } catch (error) {
        console.log(error);

        cb({error: true, errorMessage: "Fatal Error Fetching Messages"});
    }
}

module.exports = FetchMessages;