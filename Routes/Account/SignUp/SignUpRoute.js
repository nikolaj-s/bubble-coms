
const route = require("express").Router();

const { AccountSchema } = require('../../../Schemas/Account/AccountSchema');

const ValidateNewAccountData = require("../Validation/ValidateNewAccountData");

const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');

route.post('/', async (req, res, next) => {
    try {
        const data = req.body;
        
        const validate = ValidateNewAccountData(data);

        if (validate.error) return res.send({error: true, errorMessage: validate.error.details[0].message});
        
        // validate password
        if (data.password !== data.confirmPassword) return res.send({error: true, errorMessage: "Passwords Do No Match"});
        
        // check if email is already in use
        const emailInUse = await AccountSchema.findOne({email: data.email})

        if (emailInUse) return res.send({error: true, errorMessage: "Account with that email already exists"});

        const userNameInUse = await AccountSchema.findOne({username: data.username});

        if (userNameInUse) return res.send({error: true, errorMessage: "User In Use"});

        // HASH PASSWORD
        const salt = await new bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(data.password, salt);

        const newAccount = new AccountSchema({
            username: data.username,
            user_image: "https://res.cloudinary.com/drlkgoter/image/upload/v1663868935/1-Blank-TikTok-Default-PFP_jt6guo.jpg",
            user_banner: "https://res.cloudinary.com/drlkgoter/image/upload/v1665247424/wallhaven-x1395d_s3jgpw.jpg",
            email: data.email,
            display_name: data.username,
            password: hashedPassword
        })

        const saved = await newAccount.save();

        await saved.generate_secret();

        const token = jwt.sign({_id: saved._id, username: saved.username}, process.env.SECRET);

        res.send({success: true, token: token})
        
    } catch (error) {
        console.log(error)
        res.send({error: true, errorMessage: "Fatal Error Occured During Account Creation"});
        return;
    }
})

module.exports = route;