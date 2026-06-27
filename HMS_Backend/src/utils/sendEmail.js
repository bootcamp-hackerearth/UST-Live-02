const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    console.log("Sending email...");

    const sender = {
      email: process.env.SENDER_EMAIL,
      name: "HMS System",
    };

    const receivers = [
      {
        email: to,
      },
    ];

    const response = await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject,
      htmlContent,
    });

    console.log("Email sent successfully");

    return response;
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    if (error.response) {
      console.error(error.response.body);
    }

    throw error;
  }
};

module.exports = sendEmail;
