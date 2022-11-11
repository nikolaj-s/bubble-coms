const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const ImageUpload = require("../../../Util/Image/ImageUpload");

const ImageDelete = require("../../../Util/Image/ImageDelete");

const { v4: uuidv4} = require('uuid')

const MessageSocket = async (socket, data, channelList, cb) => {
    try {

        // prevent large text
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
        const imageFormats = ['webp', 'jpg', 'jpeg', 'png']

        const videoFormats = ['webm', 'mp4', 'gif']

        const websiteFormats = ['.com', '.ca', '.co']

        let file;
        
        if (server.channels[channel].persist_social && data.file) {
            
            if (data.file.byteLength > 3000000) {
                return cb({error: true, errorMessage: "Image File Size Cannot Be larger than 3MB"})
            }

            file = await ImageUpload({data: data.file}).catch(error => {
                console.log(error)
            })

            console.log(file)

            if (file.error) {
                return cb({error: true, errorMessage: file.errorMessage});
            }

        }

        const image = file ? file.url : imageFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false)) ? data.content.text : false;

        const video = videoFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false)) ? data.content.text : false;

        const link = websiteFormats.some(format => data.content.text.includes(format)) ? data.content.text : false;

        const content = {
            image: image,
            text: data.content.text,
            video: video,
            link: link,
            local_id: data.content.local_id,
            date: new Date(),
            display_name: data.content.display_name
        }

        const message = {
            _id: uuidv4(),
            channel_id: data.channel_id,
            content: content,
            username: socket.AUTH.username
        }

        // if channel has persist data enabled --> save message to the social array in the DB
        if (server.channels[channel].persist_social) {

            await server.save_message(channel, message)
            .catch(error => {
                console.log('saving message to database error', error);
                return cb({error: true, errorMessage: 'error sending message'})
            })
        
        }

        channelList.get(`${socket.current_server}/${data.channel_id}`)?.pushMessage(message);
        
        socket.to(socket.current_server).emit("new message", message);

        cb({success: true, message});

        // clean up social when messages exceed 20
        if (server.channels[channel].social.length > 50) {

            const last_message = await server.trim_social(channel);

            if (last_message.content.image) {

                if (last_message.content.image.includes('cloudinary')) {

                    await ImageDelete(last_message.content.image);
                
                }
            
            }
        }

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Sending Message"});
    }
}

module.exports = MessageSocket;