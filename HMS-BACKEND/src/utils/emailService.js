const apiInstance = require("../config/brevoEmail");
const Brevo = require("sib-api-v3-sdk");

const sendEmail = async ({ to, subject, htmlContent,
}) => {
    try {
        await apiInstance.sendTransacEmail({
            sender: { email: process.env.FROM_EMAIL },
            to: [{ email: to }],
            subject,
            htmlContent
        });
        logger.info(`Mail sent to ${to}`);
    } catch (error) {
        logger.error("Email Error:", error.message);
        throw error;
    }
};

module.exports = { sendEmail };