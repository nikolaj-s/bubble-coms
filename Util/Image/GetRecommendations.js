
const cheerio = require('cheerio');

const axios = require('axios');

const GetRecommendations = async (query, image, nsfw = false) => {
    try {

        const cookie = "is_gdpr=0; is_gbpr_b=CK2pbRDA2QE=; i=8dPtlqc7QCADWkqO4Q07YkjTe9Gei3zaHWpZ0hrgvx19tNwSZqOywbY0u7qRJNw2CpZ7nMF+sAXPVkHuslpBqb4jSbY=; yandexuid=6363233211699822844; yashr=9070809201699822844; yp=1700427795.szm.1:3440x1440:1056x1353; bh=EkEiR29vZ2xlIENocm9tZSI7dj0iMTE5IiwgIkNocm9taXVtIjt2PSIxMTkiLCAiTm90P0FfQnJhbmQiO3Y9IjI0IhoFIng4NiIiECIxMTkuMC42MDQ1LjEyNCIqAj8wMgIiIjoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJdIkdvb2dsZSBDaHJvbWUiO3Y9IjExOS4wLjYwNDUuMTI0IiwgIkNocm9taXVtIjt2PSIxMTkuMC42MDQ1LjEyNCIsICJOb3Q/QV9CcmFuZCI7dj0iMjQuMC4wLjAiWgI/MA==; yuidss=6363233211699822844; ymex=2015182848.yrts.1699822848; gdpr=0; _ym_uid=1699822997300715431; _ym_d=1699822998; bh=Ej8iR29vZ2xlIENocm9tZSI7dj0iMTE5IiwiQ2hyb21pdW0iO3Y9IjExOSIsIk5vdD9BX0JyYW5kIjt2PSIyNCIaBSJ4ODYiIhAiMTE5LjAuNjA0NS4xMjQiKgI/MDoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJcIkdvb2dsZSBDaHJvbWUiO3Y9IjExOS4wLjYwNDUuMTI0IiwiQ2hyb21pdW0iO3Y9IjExOS4wLjYwNDUuMTI0IiwiTm90P0FfQnJhbmQiO3Y9IjI0LjAuMC4wIiI=; _yasc=R/yzBdXeiLBWaX5Crn8Jeq8vhTmDYkB6P+VUa1wJ7MFtPxzDVhXinGu7pLO/gYr45fCZARexjQ==;"

        const response = await axios.get(`https://yandex.com/images/search?cbir_page=similar&rpt=imageview&url=${image}`, {headers: {Cookie: cookie}});

        const html = response.data;

        const ch = cheerio.load(html);

        let data = ch('.serp-item[data-bem]');

        let images = [];
            
        for (const [key, value] of Object.entries(data)) {

            if (value?.attribs) {
                const attr = JSON.parse(value.attribs['data-bem'])['serp-item'];

                if (!attr.img_href.includes('https://')) {
                    continue;
                }
                
                images.push({
                    image: attr.img_href,
                    preview: `https:${attr.thumb.url}`,
                    query: query,
                    type: 'image',
                    tags: attr?.snippet?.text,
                    nsfw: nsfw,
                    bytes: attr?.preview[0]?.fileSizeInBytes,
                    width: attr?.preview[0]?.w,
                    height: attr?.preview[0]?.h,
                    alt_links: attr?.preview,
                    snippet: attr?.snippet
                })

            }
        }
        
        return images;

    } catch (error) {
        console.log(error);
        return {error: true}
    }
}

module.exports = GetRecommendations;