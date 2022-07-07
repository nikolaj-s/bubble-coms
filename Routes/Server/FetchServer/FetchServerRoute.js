const mongoose = require('mongoose');

const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');
const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.get('/', ValidationMiddleWare, async (req, res, next) => {
    try {

        const user = req.user;

        const server_id = req.header("SERVER_ID");
        
        const server = await ServerSchema.findOne({_id: mongoose.Types.ObjectId(server_id)}).select("-server_password");
        
        if (!server) return res.send({error: true, errorMessage: "error server does not exist"});
        
        const server_data = {
            server_name: server.server_name,
            server_banner: server.server_banner,
            members: server.members,
            channels: server.channels,
            ban_list: server.ban_list,
            server_groups: server.server_groups,
            owner: server.server_owner === user.user_name ? true : false
        }

        res.send({success: true, server: server_data});
    } catch (error) {
        console.log(error);
        return res.send({error: true, errorMessage: "fatal error retrieving server details"})
    }
})

module.exports = route;