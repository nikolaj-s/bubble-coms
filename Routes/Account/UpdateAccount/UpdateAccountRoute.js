const ImageDelete = require('../../../Util/Image/ImageDelete');
const ImageUpload = require('../../../Util/Image/ImageUpload');
const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res, next) => {
    try {
        const user = req.user;

        const new_data = req.body;

        const images = req.files;

        if (new_data.displayName !== user.display_name) {

            if (new_data.displayName.length > 30) return res.send({error: true, errorMessage: "display name cannot be greater than 30 characters"})

            await user.update_display_name(new_data.displayName);

        }

        if (images) {
            if (images.userImage) {
                if (user.user_image) await ImageDelete(user.user_image);

                const userImage = await ImageUpload(images.userImage);

                if (userImage.error) return res.send({error: true, errorMessage: userImage.errorMessage});

                await user.update_user_image(userImage.url);
            }
            if (images.userBanner) {
                if (user.user_banner) await ImageDelete(user.user_banner);

                const userBanner = await ImageUpload(images.userBanner);

                if (userBanner.error) return res.send({error: true, errorMessage: userBanner.errorMessage});

                await user.update_user_banner(userBanner.url);
            }
        }

        await user.save();

        res.send({success: true, user: {display_name: user.display_name, user_banner: user.user_banner, user_image: user.user_image}});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "Fatal Error Updating Account"})
    } 
})

module.exports = route;