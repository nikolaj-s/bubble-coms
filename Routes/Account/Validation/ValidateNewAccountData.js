
const joi = require('@hapi/joi');

const ValidateNewAccountData = (data) => {

    const valid = joi.object({
        username: joi.string().min(3).max(32).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(64).required(),
        confirmPassword: joi.string().min(6).max(64).required()
    })

    return valid.validate(data);
}

module.exports = ValidateNewAccountData;