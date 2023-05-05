
const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const { ServerSchema } = require('../../Schemas/Server/Server/ServerSchema');

const VideoSearch = require('../../Util/Video/VideoSearch');

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

        const videos = await VideoSearch(query);

        if (videos.error || videos.length === 0) return res.send({error: true, errorMessage: "No Image Results"});

        res.send({success: true, media: videos});

        const data_to_save = [...videos.splice(6, 10), ...server.recent_image_searches];

        await server.update_recent_image_searches(data_to_save);

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: error.message});
    }
})

module.exports = route;