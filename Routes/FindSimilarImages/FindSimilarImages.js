const GetRecommendations = require("../../Util/Image/GetRecommendations");

const ValidationMiddleWare = require("../Validation/ValidationMiddleWare");

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {

        const image_source = req.body.source;

        if (!image_source) return res.send({error: true, errorMessage: "Invalid Image Source"});

        const similar_images = await GetRecommendations("", image_source, false);

        if (similar_images.length === 0) return res.send({error: true, errorMessage: "No similar images found"});

        res.send({images: similar_images});

        return;

    } catch (error) {
        res.send({error: true, errorMessage: "Fatal error finding similar images"});

        return;
    }
})

module.exports = route;