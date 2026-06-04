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
        console.log(`Mail sent to ${to}`);
    } catch (error) {
        console.error("Email Error:", error);
        throw error;
    }
};

module.exports = { sendEmail };