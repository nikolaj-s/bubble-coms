
const nodemailer = require('nodemailer');

const verificationTemplate = require('./VerificationTemplate');

const SendVerificationEmail = async (email, verificationCode) => {
    try {
        console.log(process.env.EMAIL,process.env.EMAIL_PASSWORD)

        const transport = nodemailer.createTransport({
            host: "live.smtp.mailtrap.io",
            port: 587,
            auth: {
                user: "api",
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        let options = {
            from: 'noreplybubble@bubblenetwork.online',
            to: email,
            subject: "Verification Email For Your Bubble Account",
            html: verificationTemplate(verificationCode),  
        }

        transport.sendMail(options, function(err, info) {
            if (err) {
                console.log(err)
                return {error: true, errorMessage: 'error sending email'}
            } else {
                return {success: true}
            }
        })

        return {};

    } catch (error) {
        return {error: true, errorMessage: "Fatal Error Sending Verification Email"}
    }
}

module.exports = SendVerificationEmail;