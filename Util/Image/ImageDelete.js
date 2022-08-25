const Cloudinary = require('cloudinary').v2;

Cloudinary.config({
    api_key: process.env.api_key,
    cloud_name: process.env.cloud_name,
    api_secret: process.env.api_secret
})

const ImageDelete = async (image) => {
    try {
        return new Promise((resolve, reject) => {
            if (!image || image.length === 0) return {error: true, errorMessage: "no previous image"};

            const arr = image.split('/')

            const id = arr[arr.length - 1].split('.')[0];

            Cloudinary.api.delete_resources(id, function(error, result) {

                if (error) return reject({error: true, errorMessage: "error deleting previous image"})

                return resolve({success: true})
                
            })
        })
            

    } catch (error) {
        console.log(error)
        return {error: true, errorMessage: "error has occured cleaning up image data"}
    }
}

module.exports = ImageDelete;