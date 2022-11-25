const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const ImageDelete = require("../../../Util/Image/ImageDelete");


const DeleteMessage = async (socket, data, cb) => {
    try {
        
        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "validation error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "validation error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_channels === false) return cb({error: true, errorMessage: "not authorized to perform this action"});

        const message_id = data.message_id;

        const channel_id = data.channel_id;

        if (!message_id || message_id === 'undefined') return cb({error: true, errorMessage: "Error Deleting Message"});

        if (!channel_id || channel_id === 'undefined') return cb({error: true, errorMessage: "Invalid Channel Id"});

        // remove image from cdn
        const channel_index = server.channels.findIndex(c => String(c._id) === channel_id);

        if (channel_index !== -1) {

            const message_index = server.channels[channel_index].social.findIndex(m => String(m._id) === String(message_id));

            if (message_index !== -1) {

                if (server.channels[channel_index].social[message_index].content.image) {

                    await ImageDelete(server.channels[channel_index].social[message_index].content.image);
                
                }

            }

        }

        await server.delete_pinned_message(message_id);

        await server.delete_message(channel_id, message_id);

        cb({success: true, message_id: message_id, channel_id: channel_id});

        socket.to(socket.current_server).emit('delete message', {message_id: message_id, channel_id: channel_id});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Deleting Message"})
    }
}

module.exports = DeleteMessage;