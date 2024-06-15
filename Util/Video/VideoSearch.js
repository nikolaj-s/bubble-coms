const cheerio = require('cheerio');
const axios = require('axios'); 

const VideoSearch = async (query, disableSafeSearch = false) => {
    try {

        let safeSearch = '&ncrnd=7901';

        if (disableSafeSearch) {
            safeSearch = "";
        }
        console.log(safeSearch)
        const cookie = "is_gdpr=0; is_gbpr_b=CK2pbRDA2QE=; i=8dPtlqc7QCADWkqO4Q07YkjTe9Gei3zaHWpZ0hrgvx19tNwSZqOywbY0u7qRJNw2CpZ7nMF+sAXPVkHuslpBqb4jSbY=; yandexuid=6363233211699822844; yashr=9070809201699822844; yp=1700427795.szm.1:3440x1440:1056x1353; bh=EkEiR29vZ2xlIENocm9tZSI7dj0iMTE5IiwgIkNocm9taXVtIjt2PSIxMTkiLCAiTm90P0FfQnJhbmQiO3Y9IjI0IhoFIng4NiIiECIxMTkuMC42MDQ1LjEyNCIqAj8wMgIiIjoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJdIkdvb2dsZSBDaHJvbWUiO3Y9IjExOS4wLjYwNDUuMTI0IiwgIkNocm9taXVtIjt2PSIxMTkuMC42MDQ1LjEyNCIsICJOb3Q/QV9CcmFuZCI7dj0iMjQuMC4wLjAiWgI/MA==; yuidss=6363233211699822844; ymex=2015182848.yrts.1699822848; gdpr=0; _ym_uid=1699822997300715431; _ym_d=1699822998; bh=Ej8iR29vZ2xlIENocm9tZSI7dj0iMTE5IiwiQ2hyb21pdW0iO3Y9IjExOSIsIk5vdD9BX0JyYW5kIjt2PSIyNCIaBSJ4ODYiIhAiMTE5LjAuNjA0NS4xMjQiKgI/MDoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJcIkdvb2dsZSBDaHJvbWUiO3Y9IjExOS4wLjYwNDUuMTI0IiwiQ2hyb21pdW0iO3Y9IjExOS4wLjYwNDUuMTI0IiwiTm90P0FfQnJhbmQiO3Y9IjI0LjAuMC4wIiI=; _yasc=R/yzBdXeiLBWaX5Crn8Jeq8vhTmDYkB6P+VUa1wJ7MFtPxzDVhXinGu7pLO/gYr45fCZARexjQ==;"

        const response = await axios.get(`https://yandex.com/video/search?text=${query}${safeSearch}`, {headers: {Cookie: cookie}});
        
        const html = response.data;
       
        const ch = cheerio.load(html);

        const videos = ch('.VideoThumb3-Video');

        const sources = ch('.VideoHostExtended-Host');

        const durations = ch('.VideoThumb3Meta-Duration');

        const titles = ch('.VideoSnippet-Title');

        const artists = ch('.VideoHostExtended-Channel');

        const bem = ch('.internal-store-updater');

        let nsfw = false;

        if (bem['0']) {

            let attr = JSON.parse(bem['0'].attribs['data-bem']);

            if (attr['internal-store-updater']?.seo?.hasPorno) {

                nsfw = true;
            
            }

        }

        if (disableSafeSearch === false && nsfw) return {error: true, errorMessage: "ERROR: Safe search is actively blocking results from this query"};
        
        const data = [];

        for (const [key, value] of Object.entries(videos)) {
            if (value?.attribs) {
                const attr = value.attribs;
                
                const url = sources[key]?.attribs?.href?.includes('http:') ? `https:${sources[key]?.attribs?.href.split('http:')[1]}` : sources[key]?.attribs?.href

                const video = {
                    video_preview: attr.src,
                    thumbnail: `https:${attr.poster}`,
                    url: url,
                    duration: durations[key]?.children[1]?.data,
                    title: titles[key]?.attribs?.title,
                    author: artists[key]?.attribs?.title,
                    type: 'video',
                    query: query,
                    nsfw: nsfw
                }

                data.push(video);

            }
        }

        
        return data;

    } catch (error) {
        console.log(error)
        return {error: true, errorMessage: error.message}
    }
}

module.exports = VideoSearch;