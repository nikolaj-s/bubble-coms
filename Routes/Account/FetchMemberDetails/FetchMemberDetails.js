
const route = require('express').Router();

const jwt = require('jsonwebtoken');

const { AccountSchema } = require('../../../Schemas/Account/AccountSchema');
const { MessageSchema } = require('../../../Schemas/Message/MessageSchema');
const { ServerSchema } = require('../../../Schemas/Server/Server/ServerSchema');

route.get('/', async (req, res, next) => {
    try {
        const token = req.header('TOKEN');

        if (!token) return res.send({error: true, errorMessage: "Access Denied"});
   
        const Account = await AccountSchema.findOne({username: req.header("username")});
        
        const Server = await ServerSchema.findOne({_id: req.header("server_id")});

        if (!Server) return res.send({error: true, errorMessage: "Validation Error"});
        
        let pinned_msg = {};

        if (Account.pinned_message) {
            const d = await MessageSchema.findOne({_id: Account.pinned_message});

            if (d) {
                pinned_msg = d;
            } else {
                await Account.handle_pin_message("");
            }
        }

        const member = Server.members.findIndex(u => u.username === Account.username);

        if (Account) {

            let screen_shots = Account.show_case_screen_shots ? await MessageSchema.find({username: Account.username, screen_shot: true}).sort({"date": -1}).limit(5) : [];

            const acccount_details = {
                bio: Account.bio,
                color: Account.color,
                pinned_message: pinned_msg,
                screenShots: screen_shots,
                recent_activity: Account.recent_activity,
                server_score: Server.members[member].server_score
            }

            return res.send({success: true, ...acccount_details})

        } else {
            return res.send({error: true, errorMessage: "Access Denied"})
        }
        
    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "Fatal Error Retrieving Account Details"})
    }
})

module.exports = route;