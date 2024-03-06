const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res, next) => {
    try {

        console.log('updating social data')

        const user = req.user;

        await user.update_social_data(req.body.social_data);

        res.send({success: true});
    } catch (error) {
        console.log(error);
        res.send({error: true});
    }
})

module.exports = route;