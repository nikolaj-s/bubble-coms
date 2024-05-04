const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const { ServerSchema } = require('../../Schemas/Server/Server/ServerSchema');

const ImageSearch = require('../../Util/Image/ImageSearch');

const { default: mongoose } = require('mongoose');
const GetRecommendations = require('../../Util/Image/GetRecommendations');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {
        
        const query = req.body.query;

        const format = req.body.format;

        const source = req.body.source;

        const sortBy = req.body.sortBy;

        console.log(sortBy)

        if (query.length < 1) return res.send({error: true, errorMessage: "Invalid Query"});

        const server_id = req.body.server_id;

        if (!server_id) {

            const l_images = await ImageSearch(query, "", format, source, sortBy);

            if (l_images.error || l_images.length === 0) return res.send({error: true, errorMessage: "No Results"});

            return res.send({success: true, media: l_images});

        }

        const server = await ServerSchema.findOne({_id: mongoose.Types.ObjectId(server_id)})
        
        if (!server) return res.send({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(req.user.username);
        
        if (member === -1) return res.send({error: true, errorMessage: "unauthorized activity"});
        
        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_post_channel_social) return res.send({error: true, errorMessage: "unauthorized activity"});

        let blocked = false;

        const banned_words = server.banned_keywords;

        for (const w of banned_words) {
            if (query.toLowerCase().includes(w)) {
                blocked = true;
                break;
            }
        }

        if (blocked) return res.send({error: true, errorMessage: "Your Search Has Been Blocked As It Contains A Banned Keyword"});

        const images = await ImageSearch(query, query, format, source);

        if (images.error || images.length === 0) return res.send({error: true, errorMessage: "No Image Results"});

        res.send({success: true, media: images});

        
        // build recomendations

        await server.update_search_times();

        if (server.times_media_searched > 2 || server.recent_image_searches.length <= 100) {
            
            try {

                let related_image;

                const randomIndex = Math.floor(Math.random()*images.length)

                related_image = images[randomIndex];
                
                const reccomendations = await GetRecommendations(related_image.query, related_image.preview, related_image.nsfw);
                
                if (reccomendations.length === 0) return;

                const data_to_save = [...reccomendations.slice(1, 8), ...server.recent_image_searches.slice(0, 92)];
            
                await server.update_recent_image_searches(data_to_save);
            } catch (err) {
                return err;
            }
        
        }

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: error.message});
    }
})

module.exports = route;