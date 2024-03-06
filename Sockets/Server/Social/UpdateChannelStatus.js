const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");


const UpdateChannelStatus = async (socket, data, cb, serverList) => {
    try {

        const user = await AccountSchema.findOne({username: socket.AUTH.username});

        if (!user) return cb({error: true, errorMessage: "Validation Error"});

        const current = serverList.get(socket.current_server);

        if (current) {
            current.update_user_social_status(socket.id, data.channel);
        }

        cb({success: true, channel: data.channel, user: socket.AUTH.username});

        socket.to(socket.current_server).emit('update channel status', {channel: data.channel, user: socket.AUTH.username});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error updating channel status"});
    }
}

module.exports = UpdateChannelStatus;