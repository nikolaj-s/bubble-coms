const route = require('express').Router();

const ValidationMiddleWare = require("../../Validation/ValidationMiddleWare");

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {

        const user = req.user;

        if (req.body.verification_key !== user.verification_key) return res.send({error: true, errorMessage: "Invalid Verification Code"});

        
    } catch (error) {
        console.log(error);
        return res.send({error: true, errorMessage: "Fatal Error Validating Account"})
    }
})

module.exports = route;