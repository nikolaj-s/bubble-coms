const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const { ServerCardSchema } = require("../../../Schemas/Server/ServerCard/ServerCardSchema");


const BanUserSocket = async (socket, data, cb, serverList) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Fatal verfication error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "unauthorized activity"});

        const server_group = await server.get_server_group(member.server_group);
    
        if (server_group === -1 || !server_group.user_can_ban_user) return cb({error: true, errorMessage: "unauthorized activity"});

        const user_to_ban = await server.get_member(data.username);

        const user_to_ban_server_group = await server.get_server_group(user_to_ban.server_group);

        if (user_to_ban_server_group.server_group_name === 'Owner') return cb({error: true, errorMessage: "Cannot ban server owner"});

        if (user_to_ban === -1) return cb({error: true, errorMessage: "Error banning user"});

        const online = serverList.get(socket.current_server).get_socket_id_by_member_id(String(user_to_ban._id));

        if (online) {
            socket.to(online).emit('banned', {server_id: socket.current_server});
        }

        const ban_data = await server.ban_user(user_to_ban._id, user_to_ban.username);
        
        const server_card = await ServerCardSchema.findOne({server_id: socket.current_server});

        const user = await AccountSchema.findOne({username: user_to_ban.username});

        if (user) {

            await user.user_has_been_banned(String(server_card._id));

        }

        socket.to(socket.current_server).emit('user banned', {...user_to_ban, banData: ban_data});

        cb({success: true, ...user_to_ban, banData: ban_data});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: error.message})
    }
}

module.exports = BanUserSocket;