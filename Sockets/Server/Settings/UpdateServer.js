const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');
const { ServerCardSchema } = require('../../../Schemas/Server/ServerCard/ServerCardSchema');

const ImageDelete = require('../../../Util/Image/ImageDelete');

const ImageUpload = require('../../../Util/Image/ImageUpload');

const UpdateServer = async (socket, data, cb) => {
    try { 

        const user = socket.AUTH.username;

        const server = await ServerSchema.findOne({_id: socket.current_server});

        const server_card = await ServerCardSchema.findOne({server_id: socket.current_server});

        if (!server._id && !server_card._id) return cb({error: true, errorMessage: "fatal error"});

        const member = await server.get_member(user);

        if (member === -1) return cb({error: true, errorMessage: 'unauthorized activity'});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1) return cb({error: true, errorMessage: 'unauthorized activity'});

        let newServerBanner;

        // validate new data
        if (data.server_name !== null && data.server_name !== server.server_name) {
            if (permissions.user_can_edit_server_name === false) return cb({error: true, errorMessage: "you do not have permission to perform that action"});

            if (data.server_name === server.server_name) return cb({error: true, errorMessage: "server name is the same as before"})

            if (data.server_name.length > 128) return cb({error: true, errorMessage: "server name cannot be greater than a 128 characters"});

            if (data.server_name.length < 6) return cb({error: true, errorMessage: "server name cannot be less than 6 characters"}); 
            
        }
 
        if (data.server_banner) {

            if (permissions.user_can_edit_server_banner === false) return cb({error: true, errorMessage: "you do not have permissions to perform that action"});

            if (data.server_banner.byteLenght > 3000000) return cb({error: true, errorMessage: "Server banner cannot be more than 3MB"});

        }

        if (data.server_name) {
            await server.update_server_name(data.server_name);

            await server_card.update_server_name(data.server_name);
        }

        if (data.server_banner) {
            await ImageDelete(server.server_banner);

            newServerBanner = await ImageUpload({data: data.server_banner})
            .catch(error => {
                console.log(error);
                return cb({error: true, errorMessage: "fatal error uploading new banner"});
            })

            if (newServerBanner?.error) return cb({error: true, errorMessage: "fatal error uploading server banner"});

            await server.update_server_banner(newServerBanner.url);

            await server_card.update_server_banner(newServerBanner.url);

        }

        await server.save();

        const data_to_send = {
            success: true, 
            data: {
                server_banner: server.server_banner,
                server_name: server.server_name
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