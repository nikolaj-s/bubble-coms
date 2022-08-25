const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const ImageDelete = require("../../../Util/Image/ImageDelete");


const UpdateChannel = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "validation error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "validation error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_channels === false) return cb({error: true, errorMessage: "not authorized to perform this action"});

        let new_channel_data = data;

        new_channel_data.widgets.forEach(async widget => {
            if (widget.delete && widget.type === 'image') {
                await ImageDelete(widget.content.text);
            }
        })

        new_channel_data.widgets = new_channel_data.widgets.filter(widget => widget.delete ? false : true);

        const saved_data = await server.update_channel(new_channel_data._id, new_channel_data);

        if (saved_data.error) return cb({error: true, errorMessage: "fatal error updating channel"});

        cb({success: true, channel: saved_data});

        socket.to(socket.current_server).emit('channel update', {channel: saved_data});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Updating Channel"});
    }
}

module.exports = UpdateChannel;