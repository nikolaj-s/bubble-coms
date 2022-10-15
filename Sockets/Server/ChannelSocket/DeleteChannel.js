const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const ImageDelete = require("../../../Util/Image/ImageDelete");


const DeleteChannel = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "validation error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "validation error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_channels === false) return cb({error: true, errorMessage: "not authorized to perform this action"});

        const channel_to_delete = await server.get_channel(data.channel_id);

        if (channel_to_delete === -1) return cb({error: true, errorMessage: "channel does not exist"});

        // clean up images stored in the db

        if (server.channels[channel_to_delete]?.channel_background) {

            await ImageDelete(server.channels[channel_to_delete].channel_background);

        }

        server.channels[channel_to_delete].social.forEach(async message => {
            if (message.content.image) {
                if (message.content.image.includes('cloudinary')) {
                    await ImageDelete(message.content.image);
                }   
                
            }
        })

        server.channels[channel_to_delete].widgets.forEach(async widget => {
            if (widget.type === 'image') {
                await ImageDelete(widget.content.text)
            }
        })

        const deleting = await server.delete_channel(data.channel_id);

        if (deleting.error) return cb({error: true, errorMessage: 'error deleting channel'});

        cb({success: true, channel_id: data.channel_id});

        socket.to(socket.current_server).emit('delete channel', {channel_id: data.channel_id});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error"})
    }
}

module.exports = DeleteChannel;