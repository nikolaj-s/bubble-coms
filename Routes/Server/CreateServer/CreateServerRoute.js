
const ImageUpload = require('../../../Util/Image/ImageUpload');
const ImageDelete = require('../../../Util/Image/ImageDelete');
const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');
const ValidateNewServerData = require('../Validation/ValidateNewServerData');

// schemas
const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');
const { ServerCardSchema } = require('../../../Schemas/Server/ServerCard/ServerCardSchema');

const route = require('express').Router();

const bcrypt = require('bcryptjs');

route.post('/', ValidationMiddleWare, async (req, res, next) => {
    try {
        // required data assigned to variables
        const user = req.user;

        const data = {...req.body};
        
        const file = req.files === null || req.files === undefined ? null : req.files.image;
        
        // check if user has reached server max:
        if (user.created_servers.length === 2) return res.send({error: true, errorMessage: "You have reached the server limit with your current plan."})

        const validate = ValidateNewServerData(data);

        // send error back to client if error has been thrown from validate
        if (validate.error) return res.send({error: true, errorMessage: validate.error.details[0].message})

        // check if user provided a server banner
        const image = await ImageUpload(file);
        
        if (image.error) return res.send({error: true, errorMessage: image.errorMessage});

        // hash server password
        const salt = await new bcrypt.genSalt(10);

        const password = await bcrypt.hash(data.server_password, salt);

        const server = new ServerSchema({
            server_name: data.server_name,
            server_banner: image.url,
            server_password: password,
            server_owner: user.username,
        })

        const savedServer = await server.save();
        // push _id of server to users created server array
        await user.push_created_server_id(savedServer._id);

        const serverCard = new ServerCardSchema({
            server_name: savedServer.server_name,
            server_banner: savedServer.server_banner,
            server_id: savedServer._id,
        })

        const savedServerCard = await serverCard.save();

        // push serverCardId to users joined servers array
        await user.join_server(savedServerCard._id);

        // create member
        const member = {
            username: user.username,
            user_image: "",
            user_banner: "",
            server_group: savedServer.server_groups[1]._id,
            display_name: ""
        }

        await savedServer.user_joins_server(member);

        return res.send({success: true, server: savedServerCard});

    } catch (error) {
        console.log(error); 
        res.send({error: true, errorMessage: "Fatal Error Creating Server"})
    }
})

module.exports = route;