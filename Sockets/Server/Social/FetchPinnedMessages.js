const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");

const FetchPinnedMessages = async (socket, data, cb) => {
    try {

        const d = await MessageSchema.find({server_id: socket.current_server, pinned: true}).limit(data.count);

        let pins = d.length < data.count ? [...d, {no_more_pins: true}] : d;

        cb({pins: pins});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Pinning Message"});
    }
}

module.exports = FetchPinnedMessages;