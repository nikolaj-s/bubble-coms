
const joi = require('@hapi/joi');

const ValidateSignInData = (data) => {
    const valid = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    })

    return valid.validate(data);
}

module.exports = ValidateSignInData;