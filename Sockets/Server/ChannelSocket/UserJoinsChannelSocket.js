
const Peer = require("../../../MediaSoup/Peer/Peer");

const Channel = require("../../../MediaSoup/Channel/Channel");

const UserJoinsChannelSocket = async (socket, data, io, channelList, getMediasoupWorker, cb) => {
    try {

        const channel_id = `${data.server_id}/${data.channel_id}`;

        if (!channelList.has(channel_id)) {
            
            let worker = await getMediasoupWorker();

            channelList.set(channel_id, new Channel(channel_id, worker, io));
        }

        if (channelList.get(channel_id)?.peers?.has(socket.id)) return cb({error: true, errorMessage: "you are already in this channel"});

        channelList.get(channel_id).addPeer(new Peer(socket.id, socket.AUTH.username, data.user));

        socket.channel_id = channel_id;

        socket.join(channel_id);

        const data_to_send = {
            _id: data.user._id,
            channel: {_id: data.channel_id},
            username: socket.AUTH.username,
            user_image: data.user.user_image,
            user_banner: data.user.user_banner,
            display_name: data.user.display_name,
            mirror_web_cam: data.user.mirror_web_cam,
            color: data.user.color
        }

        socket.to(data.server_id).emit('user joins channel', data_to_send);

        cb({success: true, message: "user has joined the channel"});
    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error joining server"})
    }
}

module.exports = UserJoinsChannelSocket;