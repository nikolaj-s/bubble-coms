const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req,res) => {
    try {

        const new_joined_servers = req.body.new_server_order.map(s => s._id);
        
        await req.user.re_order_servers(new_joined_servers);

        res.send({success: true, new_server_order: new_joined_servers});

    } catch (err) {
        res.send({error: true, errorMessage: "Fatal Error Saving New Server List Order"});
    }
})

module.exports = route;