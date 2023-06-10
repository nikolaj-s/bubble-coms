const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const DeleteImageSearchData = async (socket, data, cb) => {
    try {

        const user = socket.AUTH.username;

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "fatal error"});

        const member = await server.get_member(user);

        if (member === -1) return cb({error: true, errorMessage: 'unauthorized activity'});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_edit_server_name === false) return cb({error: true, errorMessage: 'unauthorized activity'});

        await server.clear_image_search_data();

        cb({success: true});

        socket.to(socket.current_server).emit('image data cleared');

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: error.message})
    }
}

module.exports = DeleteImageSearchData;