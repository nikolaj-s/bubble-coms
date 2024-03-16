const { ProfileDecoration } = require("../../Schemas/ProfileDecoration/ProfileDecoration");
const ValidationMiddleWare = require("../Validation/ValidationMiddleWare");

const route = require('express').Router();

route.get('/', ValidationMiddleWare, async (req, res) => {
    try {

        const decorations = await ProfileDecoration.find();

        res.send({success: true, data: decorations});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "Fatal Error Fetching Profile Decorations"});
    }
})

module.exports = route;