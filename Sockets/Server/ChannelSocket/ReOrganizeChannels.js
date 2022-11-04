const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const ReOrganizeChannels = async (socket, data, cb) => {
    try {
        
        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "validation error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "validation error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_channels === false) return cb({error: true, errorMessage: "not authorized to perform this action"});

        await server.re_organize_channels(data.new_order);

        socket.to(socket.current_server).emit('new channel order', data);

        cb(data);

    } catch (error) {
        cb({error: true, errorMessage: error})
    }
}

module.exports = ReOrganizeChannels;