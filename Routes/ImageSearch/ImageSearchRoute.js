const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const { ServerSchema } = require('../../Schemas/Server/Server/ServerSchema');

const ImageSearch = require('../../Util/Image/ImageSearch');

const { default: mongoose } = require('mongoose');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {
        
        const query = req.body.query;

        const server_id = req.body.server_id;

        const server = await ServerSchema.findOne({_id: mongoose.Types.ObjectId(server_id)})
        
        if (!server) return res.send({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(req.user.username);
        
        if (member === -1) return res.send({error: true, errorMessage: "unauthorized activity"});
        
        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_post_channel_social) return res.send({error: true, errorMessage: "unauthorized activity"});

        const images = await ImageSearch(query);

        if (images.error || images.length === 0) return res.send({error: true, errorMessage: "No Image Results"});

        res.send({success: true, media: images});

        
        // build recomendations

        await server.update_search_times();

        if (server.times_media_searched > 2 || server.recent_image_searches.length < 120) {
            
            try {

                let related_query;

                for (const i of images) {
                    if (i.tags.length > 8) {
                        related_query = i.tags;
                        break;
                    }
                }

                console.log('recommended', related_query)


                if (!related_query || related_query === '' || related_query === ' ') return;
    
                const reccomendations = await ImageSearch(related_query);
                
                if (reccomendations.length === 0) return;

                const data_to_save = [...reccomendations.slice(0, 10), ...server.recent_image_searches.slice(0, 120)];
            
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