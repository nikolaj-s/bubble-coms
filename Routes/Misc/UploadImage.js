
const ImageUpload = require('../../Util/Image/ImageUpload');
const ValidationMiddleWare = require('../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res) => {
    try {

        const data = req.files;
        
        const image_url = await ImageUpload(data.image);

        if (image_url.error) res.send({error: true, errorMessage: image_url.errorMessage});

        res.send({image: image_url});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "fatal error has occured while uploading image"});
    }
})

module.exports = route;