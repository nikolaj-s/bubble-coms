const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');

const route = require('express').Router();

const bcrypt = require('bcryptjs');
const { ServerCardSchema } = require('../../../Schemas/Server/ServerCard/ServerCardSchema');

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {
        const data = req.body;

        const user = req.user;

        if (!user) return res.send({error: true, errorMessage: "Validation Error"});
        
        if (!data.server_id) return res.send({error: true, errorMessage: "invalid server details"});

        if (!data.password || data?.password.length < 4) return res.send({error: true, errorMessage: "invalid password"})

        const server = await ServerSchema.findOne({_id: data.server_id});

        if (!server) return res.send({error: true, errorMessage: "error finding server to join"});

        const joined = await server.get_member(user.username);

        if (joined !== -1) return res.send({error: true, errorMessage: "you are already a member of this server"});

        const banned = await server.verify_user_ban(user.username);

        if (banned) return res.send({error: true, errorMessage: "you have been banned from this server"});

        const password = await bcrypt.compare(data.password, server.server_password);

        if (!password) return res.send({error: true, errorMessage: "invalid password"});

        const user_obj = {
            username: user.username,
            display_name: user.display_name,
            server_group: server.server_groups[0]._id,
        }

        const server_card = await ServerCardSchema.findOne({server_id: server._id});

        if (!server_card) return res.send({error: true, errorMessage: "an error has occured while trying to join the server"});

        await server.user_joins_server(user_obj);

        await user.join_server(server_card._id);

        return res.send({success: true, server: server_card});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "Fatal Error has occured while trying to join this server"})
    }
})

module.exports = route;