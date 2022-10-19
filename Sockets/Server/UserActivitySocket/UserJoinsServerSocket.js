const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const userJoinsServer = async (socket, server_id, channelList, cb) => {
    try {
        const user = await AccountSchema.findOne({_id: socket.AUTH._id});

        if (!user) return cb({error: true, errorMessage: "validation error"});

        const server = await ServerSchema.findOne({_id: server_id});

        if (!server) return cb({error: true, errorMessage: "server does not exist"});

        const memberFile = await server.get_member(user.username);

        if (memberFile === -1 || memberFile.error) return cb({error: true, errorMessage: "You are not a member of this server"});

        const user_object = {
            _id: memberFile._id,
            display_name: user.display_name,
            user_banner: user.user_banner,
            user_image: user.user_image,
            username: user.username,
            server_group: memberFile.server_group
        }

        const channels = server.channels.map(channel => {
            
            return {
                _id: channel._id,
                channel_name: channel.channel_name,
                users: channelList.get(`${server._id}/${channel._id}`)?.getUserDetails() ? channelList.get(`${server._id}/${channel._id}`)?.getUserDetails() : [],
                social: channel.social.length > 0 ? channel.social : channelList.get(`${server._id}/${channel._id}`)?.social || [],
                persist_social: channel.persist_social,
                widgets: channel.widgets,
                channel_background: channel.channel_background,
                background_blur: channel.background_blur
            }
        })

        

        const server_data = {
            server_name: server.server_name,
            server_banner: server.server_banner,
            members: server.members,
            channels: channels,
            ban_list: server.ban_list,
            server_groups: server.server_groups,
            owner: server.server_owner === user.username ? true : false
        }
        
        socket.current_server = server_id;

        socket.join(server_id);

        console.log(`user has joined server ${server_id}`)

        socket.to(server_id).emit("user joins server", user_object);

        cb({success: true, server: server_data});

    } catch (error) {
        console.log(error);
    }
}

module.exports = userJoinsServer;