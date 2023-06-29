
const route = require('express').Router();

const jwt = require('jsonwebtoken');

const { AccountSchema } = require('../../../Schemas/Account/AccountSchema');
const { MessageSchema } = require('../../../Schemas/Message/MessageSchema');

route.get('/', async (req, res, next) => {
    try {
        const token = req.header('TOKEN');

        if (!token) return res.send({error: true, errorMessage: "Access Denied"});
   
        const Account = await AccountSchema.findOne({username: req.header("username")});
        
        let pinned_msg = {};

        if (Account.pinned_message) {
            const d = await MessageSchema.findOne({_id: Account.pinned_message});

            if (d) {
                pinned_msg = d;
            } else {
                await Account.handle_pin_message("");
            }
        }

        if (Account) {
            const acccount_details = {
                bio: Account.bio,
                color: Account.color,
                pinned_message: pinned_msg
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