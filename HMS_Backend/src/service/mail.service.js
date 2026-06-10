const axios = require("axios");
const https = require("node:https");

const agent = new https.Agent({
    rejectUnauthorized: false
});

const sendEmail = async (to, subject, html) => {
    try {
        console.log("Sending mail to:", to);

        const response = await axios.post(
            // "https://expert-tribble-6j95g54v9jvfxvg7-8080.app.github.dev/mail",
            "https://laughing-fishstick-4q7j596xj49xh57rv-8080.app.github.dev/mail",
            {
                to,
                subject,
                html,
            },
            {
                httpsAgent: agent
            }
        );

        console.log("Mail sent response:", response.data);
        return response.data;

    } catch (error) {
        console.log("Mail service full error:", error.response?.data || error.message);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;