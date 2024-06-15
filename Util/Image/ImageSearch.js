const cheerio = require('cheerio');

const axios = require('axios');

const fetch = require('node-fetch')

const ImageSearch = async (query, altQuery = "", format = 'images', source = false, sortBy = false, safeSearchDisabled = false) => {
    try {
        
        let sort = "";

        let safeSearch = '&ncrnd=4502'

        if (sortBy === 'new') {
            sort = "&recent=7D";
        }
        console.log('safe search disabled', safeSearchDisabled)
        if (safeSearchDisabled) {
            safeSearch = "";
        }

        const cookie = "is_gdpr=0; is_gbpr_b=CK2pbRDA2QE=; i=8dPtlqc7QCADWkqO4Q07YkjTe9Gei3zaHWpZ0hrgvx19tNwSZqOywbY0u7qRJNw2CpZ7nMF+sAXPVkHuslpBqb4jSbY=; yandexuid=6363233211699822844; yashr=9070809201699822844; yp=1700427795.szm.1:3440x1440:1056x1353; bh=EkEiR29vZ2xlIENocm9tZSI7dj0iMTE5IiwgIkNocm9taXVtIjt2PSIxMTkiLCAiTm90P0FfQnJhbmQiO3Y9IjI0IhoFIng4NiIiECIxMTkuMC42MDQ1LjEyNCIqAj8wMgIiIjoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJdIkdvb2dsZSBDaHJvbWUiO3Y9IjExOS4wLjYwNDUuMTI0IiwgIkNocm9taXVtIjt2PSIxMTkuMC42MDQ1LjEyNCIsICJOb3Q/QV9CcmFuZCI7dj0iMjQuMC4wLjAiWgI/MA==; yuidss=6363233211699822844; ymex=2015182848.yrts.1699822848; gdpr=0; _ym_uid=1699822997300715431; _ym_d=1699822998; bh=Ej8iR29vZ2xlIENocm9tZSI7dj0iMTE5IiwiQ2hyb21pdW0iO3Y9IjExOSIsIk5vdD9BX0JyYW5kIjt2PSIyNCIaBSJ4ODYiIhAiMTE5LjAuNjA0NS4xMjQiKgI/MDoJIldpbmRvd3MiQggiMTUuMC4wIkoEIjY0IlJcIkdvb2dsZSBDaHJvbWUiO3Y9IjExOS4wLjYwNDUuMTI0IiwiQ2hyb21pdW0iO3Y9IjExOS4wLjYwNDUuMTI0IiwiTm90P0FfQnJhbmQiO3Y9IjI0LjAuMC4wIiI=; _yasc=R/yzBdXeiLBWaX5Crn8Jeq8vhTmDYkB6P+VUa1wJ7MFtPxzDVhXinGu7pLO/gYr45fCZARexjQ==;"

        const response = await axios.get(`https://yandex.com/images/search?text=${query}${format === 'gifs' ? "&itype=gifan" : ""}${source && source !== "" ? "&site=" + source : ""}${sort}`, {headers: {Cookie: cookie}});
        
        const html = response.data;

        const ch = cheerio.load(html);
        
        let data = ch('.Root')["1"];
        
        const parsed = JSON.parse(data.attribs['data-state']);
        
        let inner_parse = parsed.initialState.serpList.items.entities;
        
        const nsfw = parsed.initialState.internalState.isPornoQuery;
        
        if (safeSearchDisabled === false && nsfw) return {error: true, errorMessage: "ERROR: Safe search is actively blocking results from this query"}

        let images = [];
        
        for (const [key, value] of Object.entries(inner_parse)) {
            
            if (!value.origUrl.includes('https://')) {
                continue;
            }

            let metadata = value?.alt;
           
            images.push({
                image: value.origUrl,
                preview: `https:${value.image}`,
                query: altQuery,
                type: 'image',
                tags: metadata,
                nsfw: nsfw,
                alt_links: [],
                width: value.width,
                height: value.height,
                bytes: 0,
                snippet: value?.snippet
            })
        }
        
        return images;
    } catch (error) {
        console.log(error);
        return {error: true, errorMessage: error.message}
    }
}

module.exports = ImageSearch;