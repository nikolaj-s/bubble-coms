const { MessageSchema } = require('../../../Schemas/Message/MessageSchema');
const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');


const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res, next) => {
    try {

        const user = req.user;

        const message_id = req.body.message_id;

        if (!message_id) return res.send({error: true, errorMessage: "Missing Required Data"});

        const message = await MessageSchema.findOne({_id: message_id});

        if (!message) return res.send({error: true, errorMessage: "Message No Longer Exists"});

        if (message.username !== user.username) return res.send({error: true, errorMessage: "You can only pin your own messages to your profile"});

        let message_to_save;

        if (message_id === user.pinned_message) {
            message_to_save = "";
        } else {
            message_to_save = message_id;
        }

        await user.handle_pin_message(message_to_save);

        res.send({message: message_to_save === "" ? {} : message});

    } catch (error) {
        res.send({error: true, errorMessage: 'Fatal Error Pinning Message'})
    }
})

module.exports = route;