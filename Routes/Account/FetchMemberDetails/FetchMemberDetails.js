
const route = require('express').Router();

const jwt = require('jsonwebtoken');

const { AccountSchema } = require('../../../Schemas/Account/AccountSchema');

route.get('/', async (req, res, next) => {
    try {
        const token = req.header('TOKEN');

        if (!token) return res.send({error: true, errorMessage: "Access Denied"});
   
        const Account = await AccountSchema.findOne({username: req.header("username")});
        
        if (Account) {
            const acccount_details = {
                bio: Account.bio,
                color: Account.color
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