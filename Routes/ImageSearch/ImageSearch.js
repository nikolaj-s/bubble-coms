const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const fetch = require('node-fetch')

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {

        const query = req.body.query;

        const images = await fetch(`https://customsearch.googleapis.com/customsearch/v1/siterestrict?cx=93ba4b953c47e49a6&filter=1&gl=ca&imgSize=HUGE&imgType=photo&num=10&q=${query}&safe=off&searchType=image&key=AIzaSyA6OlfIWuv8ADw_XSrZ3WDyY9bwOI3qWmA`)
            .then(response => response.json())
            .then(data => {
                if (data.items) {
                    return data.items.map(item => {
                        return item.link
                    })
                } else {
                    return {error: true}
                }
        })

        if (images.error) return res.send({error: true, errorMessage: "No Image Results"});

        res.send({success: true, images: images});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: error.message});
    }
})

module.exports = route;