const https = require("node:https");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const logger = require("./logger");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const LOCAL_ISSUER_CERT_ERROR = "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";

const shouldUseInsecureEmailTlsFallback = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_INSECURE_EMAIL_TLS !== "false";

const withEmailTlsFallback = async (sendOperation) => {
  try {
    return await sendOperation();
  } catch (error) {
    if (
      error?.code !== LOCAL_ISSUER_CERT_ERROR ||
      !shouldUseInsecureEmailTlsFallback()
    ) {
      throw error;
    }

    const previousAgent = defaultClient.requestAgent;

    defaultClient.requestAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    try {
      return await sendOperation();
    } finally {
      defaultClient.requestAgent = previousAgent;
    }
  }
};

const sendEmail = async ({ to, subject, htmlContent }) => {
  try {
    if (!process.env.BREVO_API_KEY || !process.env.SENDER_EMAIL) {
      logger.warn("Email skipped because email configuration is missing");

      return null;
    }

    logger.info("Sending email", { to, subject });

    const sender = {
      email: process.env.SENDER_EMAIL,
      name: "HMS System",
    };

    const receivers = [
      {
        email: to,
      },
    ];

    const response = await withEmailTlsFallback(() =>
      tranEmailApi.sendTransacEmail({
        sender,
        to: receivers,
        subject,
        htmlContent,
      }),
    );

    logger.info("Email sent successfully", { to, subject });

    return response;
  } catch (error) {
    logger.error("Email send failed", {
      to,
      subject,
      error,
      providerResponse: error.response?.body,
    });

    throw error;
  }
};

module.exports = sendEmail;
