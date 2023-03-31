
const jwt = require('jsonwebtoken');

const { AccountSchema } = require("../../Schemas/Account/AccountSchema");
const { default: mongoose } = require('mongoose');

const ValidationMiddleWare = async (req, res, next) => {
    try {
        const TOKEN = req.header("TOKEN");

        const verify = jwt.verify(TOKEN, process.env.SECRET);

        if (!verify) return res.send({error: true, errorMessage: "Validation ERROR"});

        const user = await AccountSchema.findOne({_id: mongoose.Types.ObjectId(verify._id)});

        if(!user) return res.send({error: true, errorMessage: "Validation ERROR"});

        req.user = user;

        next();
    } catch (error) {
        console.log(error)
        return res.send({error: true, errorMessage: "Fatal Validation Error"})
    }
}


module.exports = ValidationMiddleWare;