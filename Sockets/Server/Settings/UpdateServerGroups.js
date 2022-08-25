const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");


const UpdateServerGroups = async (socket, data, cb) => {
    try {

        const updated_server_groups = [];

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Validation Error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "Validation Error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_server_groups === false) return cb({error: true, errorMessage: true});

        const guest = server.server_groups.findIndex(group => group.server_group_name === 'Guest');

        if (guest === -1) return cb({error: true, errorMessage: "Fatal error updating server groups"});

        for (const group of data.groups) {
            if (group._id.includes('new server group')) {
                if (group.server_group_name.length < 4) return cb({error: true, errorMessage: "Server Group Name Cannot Be Less Than 4 Characters Long"});

                delete group._id;

                updated_server_groups.push({...group})
            } else if (group.delete === true) {

                for (const member of server.members) {

                    if (member.server_group === group._id) {
                        await server.assign_server_group(server.server_groups[guest]._id, member.username)
                    }

                }

            } else {
                updated_server_groups.push(group);
            }
        }

        if (updated_server_groups.length > 1 && updated_server_groups[0].server_group_name === 'Guest' && updated_server_groups[1].server_group_name === 'Owner') {
            
            await server.update_server_groups(updated_server_groups);

            await server.save();

            cb({success: true, data: server.server_groups});

            socket.to(socket.current_server).emit('updated server groups', {data: server.server_groups});

        } else {
            cb({error: true, errorMessage: "fatal error updating server groups"})
        }

        
    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error updating server groups"})
    }
}

module.exports = UpdateServerGroups;