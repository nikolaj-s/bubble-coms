const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const TogglePinMessage = async (socket, data, cb) => {
    try {

        // verify user perms
        const server = await ServerSchema.findOne({_id: socket.current_server})
        
        if (!server) return cb({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(socket.AUTH.username);
        
        if (member === -1) return cb({error: true, errorMessage: "unauthorized activity"});

        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_post_channel_social) return cb({error: true, errorMessage: "unauthorized activity"});
    
        if (data.pinned) {

            data.pinned = false;

            await server.remove_pinned_message(data);
        
        } else {

            data.pinned = true;

            await server.add_pinned_message(data);

        }

        cb({success: true, message: data});


        socket.to(socket.current_server).emit('toggle pinned message', {message: data});

    } catch (error) {
        cb({error: true, errorMessage: error.message})
    }
}


module.exports = TogglePinMessage;