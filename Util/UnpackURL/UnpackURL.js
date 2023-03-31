

const UnpackURL = (data) => {
    try {
        let link;

        let iFrame;

        let t;

        let twitter;

        if (data.includes('https')) {
            try {
                for (const text of data.split(' ')) {
                    if (text.includes('redgif')) {
                    
                        iFrame = "https://redgifs.com/ifr/" + (text.split('redgifs.com/')[1]?.includes('watch') ? text.split('redgifs.com/')[1]?.split('watch/')[1].toLowerCase() : text.split('redgifs.com/')[1]?.split('-')[0].toLowerCase());
                        
                        link = text;

                    } else if (text.includes('youtu')) {
        
                        iFrame = "https://www.youtube.com/embed/" + (text.split('/')[3].includes('watch?') ? text.split('/')[3].split('watch?v=')[1].split('&')[0] : text.split('/')[3]);
                        
                        link = text;
                        
                    } else if (text.includes('pornhub')) {
        
                        iFrame = "https://www.pornhub.com/embed/" + (text.split('viewkey=')[1])
                        
                        link = text;

                    } else  if (text.includes('xvideos')) {
        
                        iFrame = "https://www.xvideos.com/embedframe/" + (text.split('video')[1].split('/')[0]);
                        
                        link = text;

                    } else if (text.includes('reddit')) {
        
                        iFrame = "https://www.redditmedia.com/r/" + (text.split('r/')[1].split('?utm_')[0] + "?ref_source=embed&amp;ref=share&amp;embed=true&amp;theme=dark")
                        
                        link = text;

                    } else if (text.includes('steampowered')) {
        
                        iFrame = "https://store.steampowered.com/widget/" + (text.split('app/')[1].split('/')[0]);
                        
                        link = text;

                    } else if (text.includes('twitter')) {
                        
                        twitter = text.split('status/')[1].split('?')[0];
                        
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

                    } else if (text.includes('https')) {

                        link = text;
                    
                    } else {
                        t = text + " ";
                    }

                }
            } catch (err) {
                t = data;
            }
        } else {
            t = data;
        }

        return {text: t, link: link, iFrame: iFrame, twitter: twitter}

    } catch (error) {
        return {text: text, link: false, iFrame: false, twitter: false}
    }
}

module.exports = UnpackURL;