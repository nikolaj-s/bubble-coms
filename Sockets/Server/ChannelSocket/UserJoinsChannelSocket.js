
const Peer = require("../../../MediaSoup/Peer/Peer");

const Channel = require("../../../MediaSoup/Channel/Channel");
const { AccountSchema } = require("../../../Schemas/Account/AccountSchema");



const UserJoinsChannelSocket = async (socket, data, io, channelList, getMediasoupWorker, cb) => {
    try {

        const channel_id = `${data.server_id}/${data.channel_id}`;

        if (!channelList.has(channel_id)) {
            
            let worker = await getMediasoupWorker();

            channelList.set(channel_id, new Channel(channel_id, worker, io));
        }

        if (channelList.get(channel_id)?.peers?.has(socket.id)) return cb({error: true, errorMessage: "you are already in this channel"});

        const user = await AccountSchema.findOne({username: socket.AUTH.username});

        const data_to_send = {
            _id: data.user._id,
            channel: {_id: data.channel_id},
            username: socket.AUTH.username,
            user_image: data.user.user_image,
            user_banner: data.user.user_banner,
            display_name: data.user.display_name,
            mirror_web_cam: data.user.mirror_web_cam,
            color: data.user.color,
            user_image_gif_frame: user?.user_image_gif_frame,
            user_banner_gif_frame: user?.user_banner_gif_frame
        }

        channelList.get(channel_id).addPeer(new Peer(socket.id, socket.AUTH.username, data_to_send));

        socket.channel_id = channel_id;

        socket.join(channel_id);

        socket.to(data.server_id).emit('user joins channel', data_to_send);

        cb({success: true, message: "user has joined the channel"});
    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "fatal error joining server"})
    }
}

module.exports = UserJoinsChannelSocket;