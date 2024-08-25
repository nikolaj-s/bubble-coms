const { MessageSchema } = require("../../Schemas/Message/MessageSchema");


const HandleMediaOfTheDay = async (server) => {
    try {

        if (server?.image_of_the_day?.date) {
            let data = Math.floor(((Date.now() - server.image_of_the_day?.date) / 1000) / 60);

          //  if (data <= 1) return server.image_of_the_day;

        }

        const subreddits = server?.channels.filter(c => c.type === 'subreddit').map(c => {return {type: 'subreddit', name: c.channel_name, media_state: c.media_state}});

        const find_prev_songs = await MessageSchema.find({song: true, server_id: server._id}).sort({"date": -1}).limit(10)

        const last_10_media_plays = find_prev_songs.map((i) => {return {type: "song", content: i.content}});

        const recent_image_searches = server.recent_image_searches;

        const recent_videos = server.recent_videos;
        
        const media_to_pick_from = [...recent_videos, ...recent_image_searches, ...last_10_media_plays, ...subreddits].sort(() => Math.random() - 0.5).filter(c => c.type !== server.image_of_the_day.type)
        
        const mediaOfTheDay = await server.update_image_of_the_day(media_to_pick_from);

        return mediaOfTheDay;

    } catch (error) {
        return {error: true, errorMessage: "Unable Able to Set Media Of The Day"}
    }
}

module.exports = HandleMediaOfTheDay;