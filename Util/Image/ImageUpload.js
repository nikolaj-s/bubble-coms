
const Cloudinary = require('cloudinary').v2;

Cloudinary.config({
    api_key: process.env.api_key,
    cloud_name: process.env.cloud_name,
    api_secret: process.env.api_secret
})

const ImageUpload = async (file) => {
    try {
        if (!file) {
            return {success: true, url: ""};
        }

        // maximum image size is 5mb
        if (file.size >= 5000000) {
            return {error: true, errorMessage: "Unable to upload images above 5mb"}
        }

        return new Promise((resolve, reject) => {
            Cloudinary.uploader.upload_stream(file.data, function(error, result) {
                
                if (error) return reject({error: true, errorMessage: "Error uploading image to database"})

                // successful upload return secure image url
                return resolve({success: true, url: result.secure_url})

            }).end(file.data);
        })
    } catch (error) {
        return {error: true, errorMessage: "Fatal Error Uploading Image."}
    }
}

module.exports = ImageUpload;