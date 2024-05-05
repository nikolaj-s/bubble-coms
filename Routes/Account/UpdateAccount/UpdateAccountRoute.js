const bcrypt = require('bcryptjs');
const ImageDelete = require('../../../Util/Image/ImageDelete');
const ImageUpload = require('../../../Util/Image/ImageUpload');
const ValidationMiddleWare = require('../../Validation/ValidationMiddleWare');

const route = require('express').Router();

route.post('/', ValidationMiddleWare, async (req, res, next) => {
    try {
        const user = req.user;

        const new_data = req.body;

        const images = req.files;

        await user.update_new_account_state(false);

        if (new_data.showCaseScreenShots !== user.show_case_screen_shots) {
            await user.toggle_show_case_screen_shot(new_data.showCaseScreenShots);
        }

        if (new_data.hotLinkPostsDisabled !== user.hot_link_posts_disabled) {
            await user.update_hot_link_state(new_data.hotLinkPostsDisabled);
        }

        if (new_data.password) {

            if (new_data.newPassword === new_data.password) return res.send({error: true, errorMessage: "New password cannot be the same as the old password"});

            if (new_data.newPassword.length < 5) return res.send({error: true, errorMessage: "new password cannot be less than 5 characters long"});

            const current_password = await bcrypt.compare(new_data.password, user.password);

            if (!current_password) return res.send({error: true, errorMessage: "incorrect password"});

            if (new_data.newPassword !== new_data.confirmNewPassword) return res.send({error: true, errorMessage: "new password does not match confirmation"})

        }

        if (new_data.decoration) {
            await user.update_decoration(new_data.decoration);
        }

        if (new_data.displayName !== user.display_name) {

            if (new_data.displayName.length > 15) return res.send({error: true, errorMessage: "display name cannot be greater than 30 characters"})

            await user.update_display_name(new_data.displayName);

        }

        if (new_data.profileImageShape !== user.profile_picture_shape) {

            await user.update_profile_shape(new_data.profileImageShape);

        }

        if (new_data.bio !== user.bio) {

            if (new_data.bio.length > 1024) return res.send({error: true, errorMessage: "Bio cannot be more than 1024 characters"});

            await user.update_bio(new_data.bio);
        }

        if (images) {


            if (images.userImage) {

                if (images.userImage.mimetype === "image/gif" && !images.userImageGifFrame) return res.send({error: true, errorMessage: "You must update before uploading a gif image."})

                if (user.user_image) await ImageDelete(user.user_image);

                if (user.user_image_gif_frame) await ImageDelete(user.user_image_gif_frame);

                const userImage = await ImageUpload(images.userImage);

                if (userImage.error) return res.send({error: true, errorMessage: userImage.errorMessage});

                await user.update_user_image(userImage.url);

                if (images.userImageGifFrame) {
                
                    const userImageGifFrame = await ImageUpload(images.userImageGifFrame);

                    if (userImageGifFrame.url) await user.update_user_image_gif_frame(userImageGifFrame.url);

                } else {

                    await user.update_user_image_gif_frame("");
                
                }
            }
            if (images.userBanner) {

                if (images.userBanner.mimetype === "image/gif" && !images.userBannerGifFrame) return res.send({error: true, errorMessage: "You must update before uploading a gif image."})

                if (user.user_banner) await ImageDelete(user.user_banner);

                if (user.user_banner_gif_frame) await ImageDelete(user.user_image_gif_frame);

                const userBanner = await ImageUpload(images.userBanner);

                if (userBanner.error) return res.send({error: true, errorMessage: userBanner.errorMessage});

                await user.update_user_banner(userBanner.url, new_data.color);

                if (images.userBannerGifFrame) {
                
                    const userBannerGifFrame = await ImageUpload(images.userBannerGifFrame);

                    if (userBannerGifFrame.url) await user.update_user_banner_gif_frame(userBannerGifFrame.url);

                } else {

                    await user.update_user_banner_gif_frame("");
                
                }

            }
        }

        if (new_data.newPassword) {

            const salt = await new bcrypt.genSalt(10);

            const hash = await bcrypt.hash(new_data.newPassword, salt);

            await user.update_user_password(hash);

        }

        if (new_data.color !== user.color) {
            await user.update_color(new_data.color);
        }

        await user.save();

        res.send({success: true, user: {display_name: user.display_name, user_banner: user.user_banner, user_image: user.user_image, profile_picture_shape: user.profile_picture_shape, bio: user.bio, color: user.color, decoration: user.decoration, user_banner_gif_frame: user.user_banner_gif_frame, user_image_gif_frame: user.user_image_gif_frame, hot_link_posts_disabled: user.hot_link_posts_disabled}});

    } catch (error) {
        console.log(error);
        res.send({error: true, errorMessage: "Fatal Error Updating Account"})
    } 
})

module.exports = route;