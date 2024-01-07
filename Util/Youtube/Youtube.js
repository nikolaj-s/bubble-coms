
const youtube = require('scrape-youtube')

const FetchYoutubeVideo = async (query) => {
    try {

        const data = await youtube.search(query).then(res => {
            return res.videos[0];
        })

        if (!data?.id) {return {error: true, message: 'no results'}}

        return {
            id: data.id,
            duration: data.duration,
            thumbnail: data.thumbnail,
            url: data.link,
            title: data.title,
            description: data.description
        }

    } catch (error) {
        console.log(error);
        return {error: true, message: 'Error Occured Fetching Meta Data'}
    }
}

module.exports = FetchYoutubeVideo;