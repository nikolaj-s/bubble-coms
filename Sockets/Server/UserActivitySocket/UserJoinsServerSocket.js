
const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");
const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");
const ServerUserStatus = require("../../../ServerUserStatus/ServerUserStatus");

const userJoinsServer = async (socket, data, channelList, serverList, cb) => {
    try {
        const user = await AccountSchema.findOne({_id: socket.AUTH._id});

        if (!user) return cb({error: true, errorMessage: "validation error"});

        console.log(data.server_id)

        const server = await ServerSchema.findOne({_id: data.server_id});

        if (!server) return cb({error: true, errorMessage: "server does not exist"});

        const memberFile = await server.get_member(user.username);

        if (memberFile === -1 || memberFile.error) return cb({error: true, errorMessage: "You are not a member of this server"});

        let user_object = {
            _id: String(memberFile._id),
            display_name: user.display_name,
            user_banner: user.user_banner,
            user_image: user.user_image,
            profile_picture_shape: user.profile_picture_shape,
            username: user.username,
            server_group: memberFile.server_group,
            join_date: memberFile.join_date,
            server_score: (memberFile.server_score + 1),
            color: user.color
        }

        await server.update_member(user_object);

        user_object.status = data.status;

        const channels = server.channels.map(channel => {
            
            const auth = channel.locked_channel ? channel.auth_users.findIndex(m => m === user_object._id) !== -1 : true
            
            return {
                _id: channel._id,
                channel_name: channel.channel_name,
                icon: channel.icon,
                users: channelList.get(`${server._id}/${channel._id}`)?.getUserDetails() ? channelList.get(`${server._id}/${channel._id}`)?.getUserDetails() : [],
                social: !auth ? [] : channel.social.length > 0 ? channel.social : channelList.get(`${server._id}/${channel._id}`)?.social || [],
                persist_social: channel.persist_social,
                widgets: !auth ? [] : channel.widgets,
                channel_background: channel.channel_background,
                background_blur: channel.background_blur,
                disable_streams: channel.disable_streams,
                auth_users: channel.auth_users,
                locked_channel: channel.locked_channel,
                text_only: channel.text_only,
                auth: auth
            }
        })

        if (!serverList.has(data.server_id)) {

            serverList.set(data.server_id, new ServerUserStatus(data.server_id));
        
        }

        serverList.get(data.server_id).user_joins_server(socket.id, user_object);

        const member_data_to_send = [];

        for (const m of server.members) {
            
            if (serverList.get(data.server_id).get_user_by_member_id(String(m._id))) {
                member_data_to_send.push(serverList.get(data.server_id).get_user_by_member_id(String(m._id)));
            } else {
                member_data_to_send.push(m);
            }
        }
        const server_data = {
            server_name: server.server_name,
            server_banner: server.server_banner,
            members: member_data_to_send,
            channels: channels,
            ban_list: server.ban_list,
            server_groups: server.server_groups,
            owner: server.server_owner === user.username ? true : false,
            server_owner: server.server_owner,
            pinned: server.pinned_messages,
            recent_searches: server.recent_image_searches,
            inactive_channel: server.inactive_channel,
            user: user_object
        }
        
        socket.current_server = data.server_id;

        socket.join(data.server_id);

        console.log(`user has joined server ${data.server_id}`)

        socket.to(data.server_id).emit("user joins server", user_object);

        cb({success: true, server: server_data});

    } catch (error) {
        console.log(error);
    }
}

module.exports = userJoinsServer;