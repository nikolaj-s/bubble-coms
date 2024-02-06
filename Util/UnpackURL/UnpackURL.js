const Axios = require("axios");
const { getLinkPreview } = require("link-preview-js");

const UnpackURL = async (data, image, video) => {
    try {
        let link;

        let iFrame;

        let t = '';

        let twitter;

        let link_preview;

        if (data.includes('https')) {
            try {
                for (const text of data.split(' ')) {
                    if (text.includes('redgif')) {
                    
                        iFrame = "https://redgifs.com/ifr/" + (text.split('redgifs.com/')[1]?.includes('watch') ? text.split('redgifs.com/')[1]?.split('watch/')[1].toLowerCase() : text.split('redgifs.com/')[1]?.split('-')[0].toLowerCase());
                        
                        link = text;

                    } else if (text.includes('youtu.be') || text.includes('youtube.com')) {
        
                        iFrame = "https://www.youtube.com/embed/" + (text.split('/')[3].includes('watch?') ? text.split('/')[3].split('watch?v=')[1].split('&')[0] : text.split('/')[3]);
                        
                        link = text;
                        
                    } else if (text.includes('vimeo')) {
                        
                        iFrame = "https://player.vimeo.com/video/" + text.split('com/')[1].split('/').join('?h=');
                        
                        link = text;

                    } else if (text.includes('erothots')) { 

                        iFrame = "https://erothots.co/embed/video/" + text.split('video/')[1].split('/')[0];

                        link = text;

                    } else if (text.includes('spotify')) {

                        iFrame = "https://open.spotify.com/embed/" + text.split("spotify.com/")[1].split('?')[0];

                        link = text;
                        
                    } else if (text.includes('tunein.com')) {

                        let c = text.split('-'); 

                        iFrame = "https://tunein.com/embed/player/" + c[c.length - 1];

                        link = text;
                    } else if (text.includes('streamable')) {

                        let c = text.split('.com');

                        iFrame = c[0] + '.com/e' + c[1];
                    } else if (text.includes('https')) {

                        link = text;
                    
                    } else {
                        t = `${t}${text} `
                    }
                    console.log(text)
                }
            } catch (err) {
                t = data;
            }
        } else {
            t = data;
        }

        if (link && !iFrame && (!image && !video) && !link.includes('reddit') && (!link.includes('http://') || !link.includes('localhost') || !link.includes('127.0.0.1'))) {

            let preview_data = await getLinkPreview(link, {timeout: 4000, followRedirects: 'follow', headers: link.includes('xquick') || link.includes('reddit') ? { 'user-agent': 'googlebot', 'Accept-Language': 'en-US' } : {}}).catch(err => {
                console.log(err)
                return {text: t, link: link, iFrame: iFrame, twitter: twitter, link_preview: link_preview}
            }).then(d => d);

            console.log(preview_data)

            if (preview_data.description || preview_data?.images?.length > 0 || preview_data?.videos?.length > 0) {
                link_preview = preview_data;
            }

        }

        console.log(t)
        return {text: t, link: link, iFrame: iFrame, twitter: twitter, link_preview: link_preview}

    } catch (error) {
        console.log(error)
        return {text: t, link: false, iFrame: false, twitter: false, link_preview: false}
    }
}

module.exports = UnpackURL;