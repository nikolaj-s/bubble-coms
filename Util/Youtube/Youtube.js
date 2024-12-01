
const youtube = require('scrape-youtube')

const FetchYoutubeVideo = async (query) => {
    try {
        
        if (!query || query.length === 0) return {error: true, message: "Invalid query"};

        let stripped_of_params = query.split('&')[0];

        let video_id;

        if (query?.includes('?v=')) {
            video_id = stripped_of_params?.split('?v=')[1];
        } else {
            let segments = stripped_of_params?.split('/');

            video_id = segments[segments.length - 1]?.split('?')[0];
        }

        if (!video_id) video_id = query;
        console.log(video_id);

        const data = await youtube.search(video_id).then(res => {
            
            console.log(res.videos)
            console.log(res.streams)
            return [...res.videos, ...res.streams].filter(v => v.id === video_id)[0];
        })

        console.log(data)

        if (!data?.id) {return {error: true, message: 'no results'}}

        return {
            _id: data.id,
            id: data.id,
            duration: data.watching ? 9999999999 : data.duration,
            thumbnail: data.thumbnail,
            url: data.link,
            title: data.title,
            description: data.description,
            author: data?.channel?.name,
            livestream: data.watching ? true : false
        }

    } catch (error) {
        console.log(error);
        return {error: true, message: 'Error Occured Fetching Meta Data'}
    }
}

module.exports = FetchYoutubeVideo;