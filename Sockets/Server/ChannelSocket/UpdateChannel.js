const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const ImageDelete = require("../../../Util/Image/ImageDelete");
const ImageUpload = require("../../../Util/Image/ImageUpload");


const UpdateChannel = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "validation error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "validation error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_channels === false) return cb({error: true, errorMessage: "not authorized to perform this action"});

        let new_channel_data = data;

        let image;

        if (new_channel_data.file) {

            if (new_channel_data.file.byteLength > 1000000) return cb({error: true, errorMessage: 'channel background image cannot be greater than 1mb'});

            image = await ImageUpload({data: data.file})
            .catch(error => {
                console.log(error);
                return cb({error: true, errorMessage: "fatal error uploading image"});
            })

            if (image.error) {

                return cb({error: true, errorMessage: image.errorMessage});
            
            }
        }

        new_channel_data.widgets.forEach(async widget => {
            if (widget.delete && widget.type === 'image') {
                await ImageDelete(widget.content.text);
            }
        })

        new_channel_data.widgets = new_channel_data.widgets.filter(widget => widget.delete ? false : true);

        const data_to_save = {
            channel_name: new_channel_data.channel_name,
            persist_social: new_channel_data.persist_social,
            widgets: new_channel_data.widgets,
            channel_background: image?.url ? image.url : new_channel_data.channel_background,
            background_blur: new_channel_data.background_blur
        }

        if (new_channel_data.clear_social) {

            const channel_index = server.channels.findIndex(c => String(c._id) === String(new_channel_data._id));

            if (channel_index === -1) return;

            for (const m of server.channels[channel_index].social) {
                if (m.content.image) {

                    await ImageDelete(m.content.image);

                }
            }

            await server.clear_social(new_channel_data._id);

            data_to_save.social = [];
        }

        const saved_data = await server.update_channel(new_channel_data._id, data_to_save);

        if (saved_data.error) return cb({error: true, errorMessage: "fatal error updating channel"});

        cb({success: true, channel: saved_data});

        socket.to(socket.current_server).emit('channel update', {channel: saved_data});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Updating Channel"});
    }
}

module.exports = UpdateChannel;