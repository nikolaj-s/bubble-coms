
const axios = require('axios'); 

const VideoSearch = async (query) => {
    try {

        const response = await axios.get(`https://yandex.com/video/search?text=${query}`, {headers: {Cookie: 
        "gdpr=0; _ym_uid=1660276688181420567; yandexuid=3311387581657391013; yuidss=3311387581657391013; is_gdpr=0; _ym_isad=1; KIykI=1; _yasc=sKDCwm7Yz8h2ptkohvB7PSXQm1q7d21THFX4=; _ym_d=1674337568; blstr=1; gdpr=0; i=Qkwd2ZRa/Cw66rpCpmZFkVcr13SEsNfZ3Ie+pzfNTestyA=; is_gdpr_b=CPGsJRCYogEoAg==; mda=0; my=YwA; yandex_gid=21512; yashr=2264950331674334546; ymex=387581657391013#1989697553.yrts.1674337553; yp=1674939350.szm.1:3440x1440:1418x1295#1674420950.yu.3311387581657391013#1674423965.ln_tp.true#1676929566.ygu.1;"
        }});
        
        const html = response.data;
        
        const v_urls = html.match(/<div [^>]*data-video="[^"]*"[^>]*>/gm).filter(x => x.includes('thumb-preview'))

        let videos = [];
        
        for (const u of v_urls) {

            let obj = {
                title: u.split("title&quot;:&quot;")[1].split("&quot;")[0],
                preview: u.split(`"preview":{"url":"`)[1].split('",')[0],
                link: "https:" + u.split(`"thumb-preview":{"url":"`)[1].split('",')[0].split('http:')[1],
                type: 'video'
            }

            videos.push(obj)
        }

        return videos;

    } catch (error) {
        console.log(error)
        return {error: true, errorMessage: error.message}
    }
}

module.exports = VideoSearch;