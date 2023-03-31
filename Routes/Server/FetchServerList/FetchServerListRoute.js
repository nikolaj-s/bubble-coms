const route = require('express').Router();

const { ServerCardSchema } = require('../../../Schemas/Server/ServerCard/ServerCardSchema');
const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const mongoose = require('mongoose');

route.get('/', ValidationMiddleWare, async (req, res, next) => {
    try {
        // required data
        const servers = req.user.joined_servers.map(server => {return mongoose.Types.ObjectId(server)});
        console.log(servers)
        const serverCards = await ServerCardSchema.find({_id: {$in: servers}});

        res.send({success: true, servers: serverCards});

    } catch (error) {
        res.send({error: true, errorMessage: "Fatal Error Fetching Server List"})
    }
})


module.exports = route;