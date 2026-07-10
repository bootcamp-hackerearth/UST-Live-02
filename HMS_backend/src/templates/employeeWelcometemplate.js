const employeeWelcomeTemplate = ({
  name,
  email,
  employeeCode,
  temporaryPassword,
  loginLink,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #2563eb;">Welcome to HMS</h2>

      <p>Hello ${name},</p>

      <p>Your HMS account has been created successfully.</p>

      <p>
        <strong>Employee Code:</strong>
        ${employeeCode}
      </p>

      <p>
        <strong>Login Email:</strong>
        ${email}
      </p>

      <p>
        <strong>Temporary Password:</strong>
        ${temporaryPassword}
      </p>

      <p>
        <strong>Login Link:</strong>
        <a href="${loginLink}">Login to HMS</a>
      </p>

      <p>
        Please login and change your password after your first login.
      </p>

      <br />

      <p>Regards,</p>
      <p>HMS Team</p>
    </div>
  `;
};

module.exports = employeeWelcomeTemplate;
