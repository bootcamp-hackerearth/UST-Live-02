const sendEmail = async ({ to, subject, html }) => {
  try {

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "Vanguard HMS",
          email: process.env.EMAIL_USER,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo email failed: ${error}`);
    }

    console.log("Email sent successfully");

  } catch (err) {

    console.log("Email failed:", err.message);
    console.log("Full error:", err);
    console.log("Error cause:", err.cause);

    throw err;
  }
};

module.exports = sendEmail;