
const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const { ServerSchema } = require('../../Schemas/Server/Server/ServerSchema');

const VideoSearch = require('../../Util/Video/VideoSearch');
const VimeoSearch = require('../../Util/Vimeo/VimeoSearch');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {
        
        const query = req.body.query;

        const server_id = req.body.server_id;

        const server = await ServerSchema.findOne({_id: server_id})
        
        if (!server) return res.send({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(req.user.username);
        
        if (member === -1) return res.send({error: true, errorMessage: "unauthorized activity"});
        
        const videos = await VideoSearch(query, server.disable_safe_search);

        if (videos.error || videos.length === 0) return res.send({error: true, errorMessage: "No Video Results"});

        res.send({success: true, media: videos});

        const data_to_save = [...videos.splice(videos.length - 6, videos.length), ...server.recent_videos.splice(0, 44)];

        await server.update_recent_videos(data_to_save);

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: error.message});
    }
})

route.post('/vimeo/', ValidationMiddleWare, async (req, res) => {
    try {

        const query = req.body.query;

        const server_id = req.body.server_id;

        const server = await ServerSchema.findOne({_id: server_id})
        
        if (!server) return res.send({error: true, errorMessage: "unauthorized activity"});

        const member = await server.get_member(req.user.username);
        
        if (member === -1) return res.send({error: true, errorMessage: "unauthorized activity"});

        const videos = await VimeoSearch(query);

        if (videos.error) return res.send(videos);

        res.send({success: true, media: []});


    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: error.message});
    }
})

module.exports = route;