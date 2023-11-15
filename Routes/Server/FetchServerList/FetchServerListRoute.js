const route = require('express').Router();

const { ServerCardSchema } = require('../../../Schemas/Server/ServerCard/ServerCardSchema');
const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const mongoose = require('mongoose');

route.get('/', ValidationMiddleWare, async (req, res, next) => {
    try {
        // required data
        const servers = req.user.joined_servers.map(server => {return mongoose.Types.ObjectId(server)});
        
        const serverCards = await ServerCardSchema.find({_id: {$in: servers}});

        const servers_to_send = [...serverCards].sort((a, b) => {
            return req.user.joined_servers.indexOf(a._id) - req.user.joined_servers.indexOf(b._id);
        })

        res.send({success: true, servers: servers_to_send});

    } catch (error) {
        res.send({error: true, errorMessage: "Fatal Error Fetching Server List"})
    }
})


module.exports = route;