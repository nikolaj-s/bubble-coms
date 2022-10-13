const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema")

const WidgetOverlaySocket = async (socket, data, cb) => {
    try {

        if (!socket.channel_id) return cb({error: true, errorMessage: "not currently in a channel"});

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(socket.AUTH.username);
        
        if (member === -1) return cb({error: true, errorMessage: "unauthorized activity"});

        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_post_channel_social) return cb({error: true, errorMessage: "unauthorized activity"});
        
        if (!data.widget || !data.action || !data.channel_id) return cb({error: true, errorMessage: "invalid input data provided"});

        const data_to_send = {
            widget: data.widget,
            action: data.action,
            username: data.username,
            message: data.message,
            extra_info: data.extra_info,
            channel_id: data.channel_id
        }

        socket.to(socket.channel_id).emit('widget overlay', data_to_send);

        cb({success: true});
    } catch (error) {
        console.log(error)
        cb({error: true, errorMessage: "fatal error sending widget overlay action"});
    }

}

module.exports = WidgetOverlaySocket;