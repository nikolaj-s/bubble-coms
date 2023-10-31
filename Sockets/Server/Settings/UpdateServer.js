const bcrypt = require('bcryptjs');
const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');
const { ServerCardSchema } = require('../../../Schemas/Server/ServerCard/ServerCardSchema');

const ImageDelete = require('../../../Util/Image/ImageDelete');

const ImageUpload = require('../../../Util/Image/ImageUpload');

const UpdateServer = async (socket, data, cb) => {
    try { 

        const user = socket.AUTH.username;

        const server = await ServerSchema.findOne({_id: socket.current_server});

        const server_card = await ServerCardSchema.findOne({server_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "fatal error"});

        if (!server._id && !server_card._id) return cb({error: true, errorMessage: "fatal error"});

        const member = await server.get_member(user);

        if (member === -1) return cb({error: true, errorMessage: 'unauthorized activity'});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1) return cb({error: true, errorMessage: 'unauthorized activity'});

        let newServerBanner;

        // validate if password change
        if (data.server_password !== null && data.server_password.length > 1) {
            if (permissions.user_can_edit_server_password === false) return cb({error: true, errorMessage: "You do not have to required permissions to perform this action"});

            const verify_password = await bcrypt.compare(data.server_password, server.server_password);

            if (!verify_password) return cb({error: true, errorMessage: "Incorrect Server Password"});

            if (data.new_server_password !== data.confirm_new_server_password) return cb({error: true, errorMessage: "New Password does not match password confirmation"});

            if (data.new_server_password === data.server_password) return cb({error: true, errorMessage: "New password cannot match old password"});

            if (data.new_server_password.length < 6) return cb({error: true, errorMessage: "New Password cannot be less than 6 characters long"});

            const salt = await new bcrypt.genSalt(10);

            const password_to_update = await bcrypt.hash(data.new_server_password, salt);

            await server.update_server_password(password_to_update);

        }

        // validate new data
        if (data.server_name !== null && data.server_name !== server.server_name) {
            if (permissions.user_can_edit_server_name === false) return cb({error: true, errorMessage: "you do not have permission to perform that action"});

            if (data.server_name === server.server_name) return cb({error: true, errorMessage: "server name is the same as before"})

            if (data.server_name.length > 128) return cb({error: true, errorMessage: "server name cannot be greater than a 128 characters"});

            if (data.server_name.length < 6) return cb({error: true, errorMessage: "server name cannot be less than 6 characters"}); 
            
        }
 
        if (data.server_banner) {

            if (permissions.user_can_edit_server_banner === false) return cb({error: true, errorMessage: "you do not have permissions to perform that action"});

        }

        if (data.server_name) {
            await server.update_server_name(data.server_name);

            await server_card.update_server_name(data.server_name);
        }

        if (data.server_banner) {
            await ImageDelete(server.server_banner);

            if (newServerBanner?.error) return cb({error: true, errorMessage: "fatal error uploading server banner"});

            await server.update_server_banner(data.server_banner);

            await server_card.update_server_banner(data.server_banner);

        }

        if (data.inactive_channel) {
            if (permissions.user_can_edit_server_banner === false && permissions.user_can_edit_server_name === false) return cb({error: true, errorMessage: "you do not have permissions to perform that action"});

            await server.update_inactive_channel(data.inactive_channel.id);

        }

        if (data.welcome_message && (data.welcome_message !== server.welcome_message)) {

            if (permissions.user_can_edit_server_banner === false && permissions.user_can_edit_server_name === false) return cb({error: true, errorMessage: "you do not have permissions to perform that action"});

            await server.update_welcome_message(data.welcome_message);
        }

        if (data.banned_keywords) {
            if (permissions.user_can_edit_server_banner === false && permissions.user_can_edit_server_name === false) return cb({error: true, errorMessage: "you do not have permissions to perform that action"});

            await server.update_banned_keywords(data.banned_keywords);
        }
        
        const data_to_send = {
            success: true, 
            data: {
                server_banner: server.server_banner,
                server_name: server.server_name,
                inactive_channel: server.inactive_channel,
                welcome_message: server.welcome_message,
                banned_keywords: server.banned_keywords
            }
        }
        
        cb(data_to_send);

        socket.to(socket.current_server).emit('server update', data_to_send)

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error updating server"})
    }
}

module.exports = UpdateServer;