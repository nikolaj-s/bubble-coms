
const route = require('express').Router();

const jwt = require('jsonwebtoken');

const { AccountSchema } = require('../../../Schemas/Account/AccountSchema');

route.get('/', async (req, res, next) => {
    try {
        const token = req.header('TOKEN');

        if (!token) return res.send({error: true, errorMessage: "Access Denied"});

        const verified = jwt.verify(token, process.env.SECRET);

        const Account = await AccountSchema.findOne({_id: verified._id});
        
        if (Account) {
            const acccount_details = {
                username: Account.username,
                display_name: Account.display_name,
                user_image: Account.user_image,
                user_banner: Account.user_banner,
                verified: Account.verified,
                servers: Account.joined_servers,
                new_account_state: Account.new_account_state,
                profile_picture_shape: Account.profile_picture_shape,
                bio: Account.bio,
                color: Account.color
            }

            return res.send({success: true, account: {...acccount_details}})

        } else {
            return res.send({error: true, errorMessage: "Access Denied"})
        }
        

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "Fatal Error Retrieving Account Details"})
    }
})

module.exports = route;