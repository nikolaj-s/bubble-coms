const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {

        const query = req.body.query;

        if (query.length < 1) return {error: true, errorMessage: "Invalid Query"};

        

    } catch (error) {

    }
})