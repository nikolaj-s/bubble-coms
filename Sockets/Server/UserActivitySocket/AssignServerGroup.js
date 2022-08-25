const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const assignServerGroup = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Validation Error"});
        
        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "Validation Error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_server_groups === false) return cb({error: true, errorMessage: "Validation Error"});

        const member_to_update = await server.get_member(data.username);

        if (member_to_update === -1) return cb({error: true, errorMessage: 'user does not exist'});

        const member_to_update_current_permissions = await server.get_server_group(member_to_update.server_group);

        if (member_to_update_current_permissions === -1 || member_to_update_current_permissions.server_group_name === 'Owner') return cb({error: true, errorMessage: "Validation Error"});

        await server.assign_server_group(data.server_group, member_to_update.username);

        cb({success: true, data: {username: member_to_update.username, server_group: data.server_group}});

        socket.to(socket.current_server).emit('assigned new permission', {username: member_to_update.username, server_group: data.server_group});

    } catch (error) {
        console.log(error)
        cb({error: true, errorMessage: "validation error"})
    }
}

module.exports = assignServerGroup;