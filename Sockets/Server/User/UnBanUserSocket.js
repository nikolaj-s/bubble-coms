const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const UnBanUserSocket = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Fatal verfication error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "unauthorized activity"});

        const server_group = await server.get_server_group(member.server_group);
    
        if (server_group === -1 || !server_group.user_can_ban_user) return cb({error: true, errorMessage: "unauthorized activity"});

        await server.un_ban_user(data.ban_id);

        cb({success: true});

    } catch (error) {
        console.log(error)
        cb({error: true, errorMessage: error.message});
    }
}

module.exports = UnBanUserSocket;