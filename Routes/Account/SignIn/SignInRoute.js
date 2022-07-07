
const route = require('express').Router();

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const { AccountSchema } = require('../../../Schemas/Account/AccountSchema');

const ValidateSignInDate = require('../Validation/ValidateSignInData');

route.post('/', async (req, res, next) => {
    try {
        const data = req.body;

        const {error} = ValidateSignInDate(data);

        if (error) return res.send({error: true, errorMessage: error.details[0].message});

        const Account = await AccountSchema.findOne({email: data.email});

        if (!Account) return res.send({error: true, errorMessage: "Email or Password is Incorrect"});

        const Password = await bcrypt.compare(data.password, Account.password);

        if (!Password) return res.send({error: true, errorMessage: "Email or Password is Incorrect"});

        const Token = jwt.sign({_id: Account._id, username: Account.username}, process.env.SECRET);

        res.send({success: true, token: Token});

    } catch (error) {
        console.log(error)
        res.send({error: true, errorMessage: "Fatal Error Handling Sign In"});
    }
})


module.exports = route;