const axios = require("axios");
const https = require("node:https");
/**
 * Sends an email using the Brevo API
 * @param {Object} options - The email options
 * @param {string|string[]} options.to - The recipient email address or array of addresses
 * @param {string} options.subject - The email subject
 * @param {string} options.html - The HTML content of the email
 * @returns {Promise<void>} A promise that resolves when the email is sent
 */
const sendEmail = async ({ to, subject, html }) => {

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    // Accept a single address string or an array of addresses
    const recipients = Array.isArray(to)
        ? to.map((email) => ({ email }))
        : [{ email: to }];

    await axios.post(
        "https://api.brevo.com/v3/smtp/email",

        {
            sender: {
                email: process.env.EMAIL_USER,
            },

            to: recipients,

            subject,

            htmlContent: html,
        },

        {
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "Content-Type": "application/json",
            },

            httpsAgent: agent
        }
    );
};

module.exports = sendEmail;