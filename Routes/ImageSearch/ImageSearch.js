const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const fetch = require('node-fetch');
const { ServerSchema } = require('../../Schemas/Server/Server/ServerSchema');

const route = require('express').Router();



route.post('/', ValidationMiddleWare, async (req, res) => {
    try {
        
        const query = req.body.query;

        const server_id = req.body.server_id;

        const server = await ServerSchema.findOne({_id: server_id})
        
        if (!server) return res.send({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(req.user.username);
        
        if (member === -1) return res.send({error: true, errorMessage: "unauthorized activity"});
        
        const server_group = await server.get_server_group(member.server_group);
        
        if (server_group === -1 || !server_group.user_can_post_channel_social) return res.send({error: true, errorMessage: "unauthorized activity"});

        const images = await fetch(`https://customsearch.googleapis.com/customsearch/v1/siterestrict?cx=93ba4b953c47e49a6&filter=1&gl=ca&imgSize=HUGE&imgType=photo&num=10&q=${query}&safe=off&searchType=image&key=AIzaSyA6OlfIWuv8ADw_XSrZ3WDyY9bwOI3qWmA`)
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

        if (images.error) return res.send({error: true, errorMessage: "No Image Results"});

        res.send({success: true, images: images});

        const data_to_save = images.splice(4, 10);
        console.log(data_to_save)
        await server.update_recent_image_searches(data_to_save);

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: error.message});
    }
})

module.exports = route;