
const { MessageSchema } = require("../../../Schemas/Message/MessageSchema");


const FilterMessages = async (socket, data, cb) => {
    try {

        const filter = data.filter;

        const channel_id = data.channel_id;

        if (!channel_id) return cb({error: true, errorMessage: "Validation Error"});

        if (!filter?.date) return cb({error: true, errorMessage: "Invalid Argument"});

        let mediaTypeFilter = {};

        if (filter.mediaType === 'all') {
            mediaTypeFilter = {content: {$exists: true}}
        } else if (filter.mediaType === 'image') {
            mediaTypeFilter = {"content.image": {$ne: false, $exists: true}}
        } else if (filter.mediaType === 'video') {  
            mediaTypeFilter = {"content.video": {$ne: false, $exists: true}}
        } else if (filter.mediaType === 'screenshot') {
            mediaTypeFilter = {screen_shot: true}
        } else if (filter.mediaType === 'link') {
            mediaTypeFilter = {"content.image": {$exists: false}, "content.link": {$ne: false, $exists: true}}
        }

        if (filter.query.length > 0) {
            mediaTypeFilter = {...mediaTypeFilter, $or: [{"content.link": new RegExp(filter.query, 'i')}, {"content.text": new RegExp(filter.query, 'i')}, {"content.song.title": new RegExp(filter.query, 'i')}]}
        }

        if (filter.username !== '*') {
            mediaTypeFilter = {...mediaTypeFilter, username: filter.username}
        }

        const messages = await MessageSchema.find({server_id: socket.current_server, channel_id: channel_id, date: filter.date && filter.date !== 'Default' ? {$gte : filter.date} : {$exists: true}, ...mediaTypeFilter}).limit(20);

        cb({messages: messages});

    } catch (error) {
        console.log(error);
        cb({error: true, errorMessage: "Fatal Error Fetching Messages"});
    }
}

module.exports = FilterMessages;