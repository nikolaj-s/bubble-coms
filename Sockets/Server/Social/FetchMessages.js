const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const FetchMessages = async (socket, data, cb) => {
    try {

        let d;

        let nsfw;

        let authorized = true;

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Validation Error"});

        let member = server.members.find(u => u.username === socket.AUTH.username);

        if (!member) return cb({error: true, errorMessage: "Validation Error"});

        if (data.channel_id) {
            const channel = server.channels.find(c => String(c._id) === String(data.channel_id));

            if (!channel) return cb({error: true, errorMessage: "Validation Error"})

            if (channel?.locked_channel) {
                const checkIfAuth = channel.auth_users.findIndex(u => u === String(member?._id));

                if (checkIfAuth === -1) authorized = false;
            }
        }

        if (authorized === false) return cb({error: true, errorMessage: "You are not authorized to look in this channel"});
        
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