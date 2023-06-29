const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

// UTIL
const ImageUpload = require("../../../Util/Image/ImageUpload");

const ImageDelete = require("../../../Util/Image/ImageDelete");

const UnpackURL = require("../../../Util/UnpackURL/UnpackURL");

const { v4: uuidv4} = require('uuid');
const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");

const MessageSocket = async (socket, data, channelList, cb) => {
    try {
        // prevent large text
        if (!data.valid) return cb({error: true, errorMessage: "You need to update the app to send messages"});

        if (data.content.text.length === 0 && !data.file) return cb({error: true, errorMessage: "Cannot send empty message"})

        if (data.content.text.length > 511) return cb({error: true, errorMessage: "Text exceeds character limit of 512"})

        // verify user perms
        const server = await ServerSchema.findOne({_id: socket.current_server})
        
        if (!server) return cb({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(socket.AUTH.username);
        
        if (member === -1) return cb({error: true, errorMessage: "unauthorized activity"});
        
        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_post_channel_social) return cb({error: true, errorMessage: "unauthorized activity"});
        
        // check if persist social data is checked
        const channel = await server.get_channel(data.channel_id);
        
        if (channel === -1) return cb({error: true, errorMessage: 'unauthorized activity'});

        // verify message contents
        const imageFormats = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'images'];

        const videoFormats = ['webm', 'mp4', 'm4v', 'avi'];

        let file;
        
        if (data.file) {
            
            if (data.file.byteLength > 3000000) {
                return cb({error: true, errorMessage: "Image File Size Cannot Be larger than 3MB"})
            }

            file = await ImageUpload({data: data.file}).catch(error => {
                console.log(error)
            })

            if (file.error) {
                return cb({error: true, errorMessage: file.errorMessage});
            }

        }

        const image = file ? file.url : imageFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false && data.content.text.includes('mp4') === false)) ? data.content.text : false;

        const video = videoFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false)) ? data.content.text : false;

        const {text, iFrame, link, twitter} = UnpackURL(data.content.text);

        const content = {
            image: image,
            text: text,
            video: video,
            link: link,
            iFrame: iFrame,
            twitter: twitter,
            local_id: data.content.local_id,
            date: new Date,
            time: Date.now()
        } 
        const mes = new MessageSchema({
            channel_id: data.channel_id,
            content: content,
            username: socket.AUTH.username,
            pinned: false,
            server_id: String(server._id)
        })

        const message = await mes.save();

        await server.save_message(channel, message);
        
        socket.to(socket.current_server).emit("new message", message);

        cb({success: true, message});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Sending Message"});
    }
}

module.exports = MessageSocket;