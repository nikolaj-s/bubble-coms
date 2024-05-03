
const UnpackURL = require("../../../Util/UnpackURL/UnpackURL");

const { v4: uuidv4} = require('uuid');

const DirectMessage = async (socket, data, serverList, cb) => {
    try {

        const recipitent = await serverList.get(socket.current_server).get_socket_id_by_username(data.send_to);

        if (!recipitent) return cb({error: true, errorMessage: "Unable to find user to message"});

        if (data.content.text.length === 0 && !data.file) return cb({error: true, errorMessage: "Cannot send empty message"})

        if (data.content.text.length > 1024) return cb({error: true, errorMessage: "Text exceeds character limit of 1024"})

        const imageFormats = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'images'];

        const videoFormats = ['webm', 'mp4', 'm4v', 'avi'];

        let file;

        const image = file ? file.url : imageFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false && data.content.text.includes('mp4') === false)) ? data.content.text : false;

        const video = videoFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false)) ? data.content.text : false;

        const {text, iFrame, link, twitter, link_preview} = await UnpackURL(data.content.text, image, video);

        const content = {
            image: image,
            text: text,
            video: video,
            link: link,
            iFrame: iFrame,
            twitter: twitter,
            local_id: data.content.local_id,
            date: new Date(),
            time: Date.now(),
            emoji:data.content.emoji,
            textStyle: data.content.textStyle,
            link_preview: link_preview,
            reddit: data.content.reddit,
            media_meta_data: data.content.media_meta_data,
            media_video: data.content.media_video
        }

        const message = {
            _id: uuidv4(),
            channel_id: null,
            content: content,
            username: socket.AUTH.username,
            pinned: false,
            user_image: data.user_image,
            nsfw: data.nsfw
        }
        socket.to(recipitent).emit('direct message', message);

        cb({sucess: true, message});

    } catch (err) {
        console.log(err)
        cb({error: true, errorMessage: err})
    }
}

module.exports = DirectMessage;