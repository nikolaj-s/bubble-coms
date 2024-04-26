
const youtube = require('scrape-youtube');

const SearchYoutube = async (query) => {
    try {

        const results = await youtube.search(query).then(res => {
            console.log(res);
            return res.videos;
        })

        if (results.length === 0) return {error: true, message: 'No Results'};
        console.log(results)
        const mapped_data = results.map(data => {
            return {
                _id: data.id,
                id: data.id,
                duration: data.duration,
                thumbnail: data.thumbnail,
                url: data.link,
                title: data.title,
                description: data.description,
                author: data?.channel?.name,
                channel: data?.channel
            }
        })
        
        return {results: mapped_data};

    } catch (error) {
        console.log(error);
        return {error: true, message: "Error Occured While Searching for Media"}
    }
}

module.exports = SearchYoutube;