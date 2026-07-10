const https = require("node:https");

const SibApiV3Sdk = require("sib-api-v3-sdk");
const logger = require("./logger");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const TLS_ERROR_CODES = new Set([
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "ECONNRESET",
]);

const isTlsError = (error) =>
  TLS_ERROR_CODES.has(error?.code) ||
  /tls|ssl|certificate|socket disconnected/i.test(error?.message || "");

const shouldUseInsecureEmailTlsFallback = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_INSECURE_EMAIL_TLS !== "false";

const withEmailTlsFallback = async (sendOperation) => {
  try {
    return await sendOperation();
  } catch (error) {
    if (!isTlsError(error) || !shouldUseInsecureEmailTlsFallback()) {
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
      errorMessage: error.message,
      errorCode: error.code,
      providerStatus: error.status,
      providerResponse: error.response?.body,
    });

    throw error;
  }
};

module.exports = sendEmail;
