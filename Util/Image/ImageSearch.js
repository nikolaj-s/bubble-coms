const axios = require('axios');

const fetch = require('node-fetch')

const ImageSearch = async (query) => {
    try {
        
        const response = await axios.get(`https://yandex.com/images/search?text=${query}`, {headers: {Cookie: 
        "gdpr=0; _ym_uid=1660276688181420567; yandexuid=3311387581657391013; yuidss=3311387581657391013; is_gdpr=0; _ym_isad=1; KIykI=1; _yasc=sKDCwm7Yz8h2ptkohvB7PSXQm1q7d21THFX4=; _ym_d=1674337568; blstr=1; gdpr=0; i=Qkwd2ZRa/Cw66rpCpmZFkVcr13SEsNfZ3Ie+pzfNTestyA=; is_gdpr_b=CPGsJRCYogEoAg==; mda=0; my=YwA; yandex_gid=21512; yashr=2264950331674334546; ymex=387581657391013#1989697553.yrts.1674337553; yp=1674939350.szm.1:3440x1440:1418x1295#1674420950.yu.3311387581657391013#1674423965.ln_tp.true#1676929566.ygu.1;"
        }});
        
        const html = response.data;
       
        const i_urls = html.match(/<a [^>]*href="[^"]*"[^>]*>/gm).map(x => x.replace(/.*href="([^"]*)".*/, '$1')).filter(i => i.includes('img_url'));
        
        let images = [];

        for (const img of i_urls) {

            let uri = `https://${img.split('%3A%2F%2F')[1].split('%2F').join('/').split('&amp')[0].split('%3F').join('?').split('%3D').join('&')}`;

            if (uri.endsWith('.gif') || uri.endsWith('.jpg') || uri.endsWith('.png') || uri.endsWith('.webp')) {
                images.push(uri);
            }
            
        }

        // if limit has been hit with originating source fall back to old query option
        if (images.length === 0) {
            images = await fetch(`https://customsearch.googleapis.com/customsearch/v1/siterestrict?cx=93ba4b953c47e49a6&filter=1&gl=ca&imgSize=HUGE&imgType=photo&num=10&q=${query}&safe=off&searchType=image&key=AIzaSyA6OlfIWuv8ADw_XSrZ3WDyY9bwOI3qWmA`)
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
        }

        return images;
    } catch (error) {
        console.log(error);
        return {error: true, errorMessage: error.message}
    }
}

module.exports = ImageSearch;