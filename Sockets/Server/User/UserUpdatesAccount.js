const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const UserUpdatesAccount = async (socket, data, cb, channelList, serverList) => {
    try {

        if (!socket.current_server) return cb({error: true, errorMessage: "not currently in a server"});

        const user = await AccountSchema.findOne({_id: socket.AUTH._id});

        if (!user) return cb({error: true, errorMessage: "validation error"});

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "validation error"});

        const memberFile = await server.get_member(user.username);

        if (memberFile === -1 || memberFile.error) return cb({error: true, errorMessage: "You are not a member of this server"});

        let user_object = {
            _id: String(memberFile._id),
            display_name: user.display_name,
            user_banner: user.user_banner,
            user_image: user.user_image,
            username: user.username,
            server_group: memberFile.server_group,
            join_date: memberFile.join_date,
            profile_picture_shape: user.profile_picture_shape,
            color: user.color
        }

        await server.update_member(user_object);

        serverList.get(socket.current_server).update_member_data(socket.id, user_object);

        cb({success: true, user: user_object});

        socket.to(socket.current_server).emit('member file update', user_object);

    } catch (error) {
        cb({error: true, errorMessage: error.message});
    }
}

module.exports = UserUpdatesAccount;