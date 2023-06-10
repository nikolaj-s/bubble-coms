const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");

const FetchMessages = async (socket, data, cb) => {
    try {

        const d = await MessageSchema.find({channel_id: data.channel_id}).sort({"date": -1}).limit(data.count);

        let messages = d.length < data.count ? [...d, {no_more_messages: true}] : d;

        cb({messages: messages, channel_id: data.channel_id});

    } catch (error) {
        console.log(error);

        cb({error: true, errorMessage: "Fatal Error Fetching Messages"});
    }
}

module.exports = FetchMessages;