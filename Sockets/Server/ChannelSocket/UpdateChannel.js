const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const ImageDelete = require("../../../Util/Image/ImageDelete");
const ImageUpload = require("../../../Util/Image/ImageUpload");

const { v4: uuidv4} = require('uuid');

const UpdateChannel = async (socket, data, cb) => {
    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "validation error"});

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: "validation error"});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_channels === false) return cb({error: true, errorMessage: "not authorized to perform this action"});

        const channel_to_edit = server.channels.find(c => String(c._id) === String(data._id));

        if (!channel_to_edit) return cb({error: true, errorMessage: "Attempting to edit a channel that does not exist"});

        let new_channel_data = data;

        let image;

        let icon;

        let status_message = `Has: `

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

            status_message += "updated the channel background, "
        }

        if (new_channel_data.icon_file) {
            if (new_channel_data.icon_file.byteLength > 500000) return cb({error: true, errorMessage: 'channel icon to large'});

            icon = await ImageUpload({data: data.icon_file})
            .catch(error => {
                console.log(error);
                return cb({error: true, errorMessage: "fatal error uploading image"});
            })

            if (icon.error) {

                return cb({error: true, errorMessage: icon.errorMessage});
            
            }

            status_message += "updated the channel icon, "
        }

        if (new_channel_data.channel_name !== channel_to_edit.channel_name) {
            status_message += `changed channel name ${channel_to_edit.channel_name} to ${new_channel_data.channel_name}, `
        }

        new_channel_data.widgets.forEach(async widget => {
            if (widget.delete && widget.type === 'image') {
                await ImageDelete(widget.content.text);
            }
        })

        new_channel_data.widgets = new_channel_data.widgets.filter(widget => widget.delete ? false : true);

        const owner = server.members.find(u => u.username === server.server_owner);

        const auth_users = [String(owner._id), String(member._id)].concat(new_channel_data.auth_users);

        const data_to_save = {
            channel_name: new_channel_data.channel_name,
            persist_social: new_channel_data.persist_social,
            widgets: new_channel_data.widgets,
            channel_background: image?.url ? image.url : new_channel_data.channel_background,
            icon: icon?.url ? icon?.url : new_channel_data.icon,
            background_blur: new_channel_data.background_blur,
            disable_streams: new_channel_data.disable_streams,
            locked_channel: new_channel_data.locked_channel,
            auth_users: auth_users,
            channel_owner: new_channel_data.channel_owner,
            locked_media: new_channel_data.lock_media_player,
            media_auth: new_channel_data.authMediaUsers,
            contain_background: new_channel_data.contain_background,
            block_nsfw_posting: new_channel_data.block_nsfw_posting
        }

        if (new_channel_data.clear_social) {
         
            const m_data = await MessageSchema.find({channel_id: data._id});
            console.log(m_data)
            for (const m of m_data) {
                if (m.content.image) {
                    if (m.content.image.includes('cloudinary')) {

                        await ImageDelete(m.content.image);
                    
                    }
                }
            }

            await server.clear_social(new_channel_data._id);

            await MessageSchema.deleteMany({channel_id: data._id});

            data_to_save.social = [];

            status_message += 'cleared the social feed, '
        }

        const status_msg = await new MessageSchema({
            channel_id: String(server._id),
            content: {
                text: status_message += `to ${new_channel_data.channel_name}`,
                date: new Date,
                time: Date.now(),
            },
            pinned: false,
            username: socket.AUTH.username,
            server_id: String(server._id),
            status: true
        }).save();

        const saved_data = await server.update_channel(new_channel_data._id, data_to_save, status_msg);

        if (saved_data.error) return cb({error: true, errorMessage: "fatal error updating channel"});

        cb({success: true, channel: saved_data, cleared_social: new_channel_data.clear_social, status_msg: status_msg});

        socket.to(socket.current_server).emit('channel update', {channel: saved_data, cleared_social: new_channel_data.clear_social, status_msg: status_msg});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Updating Channel"});
    }
}

module.exports = UpdateChannel;