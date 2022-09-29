const route = require('express').Router();

const { ServerCardSchema } = require("../../../Schemas/Server/ServerCard/ServerCardSchema");

const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {
        const query = req.body.query;

        const servers = await ServerCardSchema.find({server_name: new RegExp(query, 'i')}).collation({locale: `en`, strength: 2});
        
        res.send({success: true, servers: servers});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "error searching for servers"})
    }
})

module.exports = route;