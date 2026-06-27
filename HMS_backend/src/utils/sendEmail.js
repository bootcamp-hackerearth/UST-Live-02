const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const isLocalIssuerError = (error) => {
  return error?.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";
};

const sendTransacEmail = ({ sender, receivers, subject, htmlContent }) => {
  return tranEmailApi.sendTransacEmail({
    sender,
    to: receivers,
    subject,
    htmlContent,
  });
};

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

    const response = await sendTransacEmail({
      sender,
      receivers,
      subject,
      htmlContent,
    });

    console.log("Email sent successfully");

    return response;
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    if (
      isLocalIssuerError(error) &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn(
        "Retrying email with relaxed TLS for local development certificate issue"
      );

      try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        const response = await sendTransacEmail({
          sender: {
            email: process.env.SENDER_EMAIL,
            name: "HMS System",
          },
          receivers: [
            {
              email: to,
            },
          ],
          subject,
          htmlContent,
        });

        console.log("Email sent successfully after TLS retry");

        return response;
      } catch (retryError) {
        console.error("EMAIL RETRY ERROR:", retryError);

        if (retryError.response) {
          console.error(retryError.response.body);
        }

        return {
          success: false,
          error: retryError.message,
        };
      }
    }

    if (error.response) {
      console.error(error.response.body);
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = sendEmail;
