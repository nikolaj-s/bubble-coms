
const route = require('express').Router();

const jwt = require('jsonwebtoken');

const { AccountSchema } = require('../../../Schemas/Account/AccountSchema');
const { MessageSchema } = require('../../../Schemas/Message/MessageSchema');
const SendVerificationEmail = require('../../../Util/Email/SendVerificationEmail');

route.get('/', async (req, res, next) => {
    try {
        const token = req.header('TOKEN');

        if (!token) return res.send({error: true, errorMessage: "Access Denied"});

        const verified = jwt.verify(token, process.env.SECRET);

        const Account = await AccountSchema.findOne({_id: verified._id});

        let pinned_message = {};

        if (Account.pinned_message) {
            const msg = await MessageSchema.findOne({_id: Account.pinned_message});

            if (msg) {
                pinned_message = msg;
            } else {
                await Account.handle_pin_message("");
            }
        }
        
        let screen_shots = await MessageSchema.find({username: Account.username, screen_shot: true}).sort({"date": -1}).limit(5);
        
        const email = Account.email.slice(0, 4) + "***********" + Account.email.split('@')[1]
        
        // if (!Account.verified) {

        //     const verification_key = await Account.generate_verification_key();

        //     const email_sent = await SendVerificationEmail(Account.email, verification_key);

        //     console.log('verification email sent')

        //     if (email_sent.error) return res.send({error: true, errorMessage: "Email Verification Has Failed, Invalid Email Address Detected Account Marked For Deletion"});
        // }

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
                color: Account.color,
                pinned_message: pinned_message,
                last_server: Account.last_server,
                screen_shots: screen_shots,
                showCaseScreenShots: Account.show_case_screen_shots,
                verified: Account.verified,
                email: email,
                social_data: Account.social_data
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