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
        const imageFormats = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'images'];

        const videoFormats = ['webm', 'mp4', 'm4v', 'avi'];

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

        const image = file ? file.url : imageFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false && data.content.text.includes('mp4') === false)) ? data.content.text : false;

        const video = videoFormats.some(format => (data.content.text.includes(format) && data.content.text.includes('redgifs') === false)) ? data.content.text : false;

        let link;

        let iFrame;

        let t;

        let twitter;

        if (data.content.text.includes('https')) {
            for (const text of data.content.text.split(' ')) {
                if (text.includes('redgif')) {
                
                    iFrame = "https://redgifs.com/ifr/" + (text.split('redgifs.com/')[1]?.includes('watch') ? text.split('redgifs.com/')[1]?.split('watch/')[1].toLowerCase() : text.split('redgifs.com/')[1]?.split('-')[0].toLowerCase());
                    
                    link = text;

                } else if (text.includes('youtu')) {
    
                    iFrame = "https://www.youtube.com/embed/" + (text.split('/')[3].includes('watch?') ? text.split('/')[3].split('watch?v=')[1].split('&')[0] : text.split('/')[3]);
                    
                    link = text;
                    
                } else if (text.includes('pornhub')) {
    
                    iFrame = "https://www.pornhub.com/embed/" + (text.split('viewkey=')[1])
                    
                    link = text;

                } else  if (text.includes('xvideos')) {
    
                    iFrame = "https://www.xvideos.com/embedframe/" + (text.split('video')[1].split('/')[0]);
                    
                    link = text;

                } else if (text.includes('reddit')) {
    
                    iFrame = "https://www.redditmedia.com/r/" + (text.split('r/')[1].split('?utm_')[0] + "?ref_source=embed&amp;ref=share&amp;embed=true&amp;theme=dark")
                    
                    link = text;

                } else if (text.includes('steampowered')) {
    
                    iFrame = "https://store.steampowered.com/widget/" + (text.split('app/')[1].split('/')[0]);
                    
                    link = text;

                } else if (text.includes('twitter')) {
                    
                    twitter = text.split('status/')[1].split('?')[0];
                    
                    link = text;

                } else if (text.includes('vimeo')) {
                    
                    iFrame = "https://player.vimeo.com/video/" + text.split('com/')[1].split('/').join('?h=');
                    
                    link = text;

                } else if (text.includes('https')) {

                    link = text;
                
                } else {
                    t = text + " ";
                }

            }
        } else {
            t = data.content.text;
        }

        const content = {
            image: image,
            text: t,
            video: video,
            link: link,
            iFrame: iFrame,
            twitter: twitter,
            local_id: data.content.local_id,
            date: new Date(),
        }

        const message = {
            _id: uuidv4(),
            channel_id: data.channel_id,
            content: content,
            username: socket.AUTH.username,
            pinned: false
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
        if (server.channels[channel].social.length > 100) {

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