
const fetch = require('node-fetch')

const { v4: uuidv4} = require('uuid')

const { ServerSchema } = require("../../../Schemas/Server/Server/ServerSchema");

const ImageUpload = require("../../../Util/Image/ImageUpload");


const AddWidgetToChannel = async (socket, data, cb) => {

    try {

        const server = await ServerSchema.findOne({_id: socket.current_server});

        if (!server) return cb({error: true, errorMessage: "Validation Error"});

        const channel = await server.get_channel(data.channel_id);

        if (channel === -1) return cb({error: true, errorMessage: "Channel Does Not Exist"});
        
        if (server.channels[channel].widgets?.length === 10) return cb({error: true, errorMessage: "you have reached this channels widget limit"})

        const member = await server.get_member(socket.AUTH.username);

        if (member === -1) return cb({error: true, errorMessage: 'Validation Error'});

        const permissions = await server.get_server_group(member.server_group);

        if (permissions === -1 || permissions.user_can_manage_channels === false) return cb({error: true, errorMessage: "You Lack The Required Permisions To Perform This Action"});

        let widget = data;

        if (widget.type === 'title') {
            widget = {
                type: 'title',
                text: widget.text
            }
        } else if (widget.type === 'plainText') {
            widget = {
                type: 'plainText',
                text: widget.text
            }
        } else if (widget.type === 'list') {
            widget = {
                type: 'list',
                text: widget.text.split(',')
            }
        } else if (widget.type === 'image') {

            if (data.file.byteLength > 1000000) {
                return cb({error: true, errorMessage: "Image Cannot Be Larger Than 1MB"})
            }

            const image = await ImageUpload({data: data.file})
            .catch(error => {
                console.log(error)
                return cb({error: true, errorMessage: "Error Uploading Image"})
            })

            widget = {
                type: 'image',
                text: image.url
            }

        } else if (widget.type === 'video') {

            const videoFormats = ['webm', 'gif', 'mp4']

            if (videoFormats.some(format => widget.text.includes(format)) === false) {
                return cb({error: true, errorMessage: 'invalid video url'})
            }

            widget = {
                type: 'video',
                text: widget.text,
                looping: widget.bool
            }

        } else if (widget.type === 'dynamicGallery') {

            const query = widget.text

            const contentFilter = widget.bool ? 'high' : 'off';
            
            const images = await fetch(`https://customsearch.googleapis.com/customsearch/v1/siterestrict?cx=93ba4b953c47e49a6&filter=1&gl=ca&imgSize=HUGE&imgType=photo&num=10&q=${query}&safe=${contentFilter}&searchType=image&key=AIzaSyA6OlfIWuv8ADw_XSrZ3WDyY9bwOI3qWmA`)
            .then(response => response.json())
            .then(data => {
                if (data.items) {
                    return data.items.map(item => {
                        return item.link
                    })
                } else {
                    return {error: true}
                }
            })
            .catch(error => {
                return {error: true}
            })

            if (images.error) return cb({error: true, errorMessage: 'no image results'});

            let currentdate = new Date(); 
            let datetime = "Last Sync: " + currentdate.getDate() + "/"
                                        + (currentdate.getMonth()+1)  + "/" 
                                        + currentdate.getFullYear() + " @ "  
                                        + currentdate.getHours() + ":"  
                                        + currentdate.getMinutes() + ":" 
                                        + currentdate.getSeconds();

            widget = {
                type: 'dynamicGallery',
                text: images,
                date: datetime
            }

        } else if (widget.type === 'music') {

            const widgetsExists = server.channels[channel].widgets.findIndex(widget => widget.type === 'music');

            if (widgetsExists !== -1) return cb({error: true, errorMessage: 'channel cannot have more than one music widget'})

            widget = {
                type: 'music',
                queue: []
            }

        }

        const dataToSave = {
            _id: uuidv4(),
            content: widget,
            type: widget.type
        }

        const savedWidget = await server.add_widget_to_channel(channel, dataToSave);

        cb({success: true, data: savedWidget, channel_id: data.channel_id});

        socket.to(socket.current_server).emit('new channel widget', {widgets: server.channels[channel].widgets, channel_id: data.channel_id});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Has Occurred"})
    }
}

module.exports = AddWidgetToChannel;