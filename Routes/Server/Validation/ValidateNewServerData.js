

const { string } = require('@hapi/joi');
const joi = require('@hapi/joi');

const ValidateNewServerData = data => {
    const validate = joi.object({
        server_name: joi.string().min(6).max(84).required(),
        server_password: joi.string().min(6).required(),
        image: joi.optional()
    })
    return validate.validate(data);
}

module.exports = ValidateNewServerData;