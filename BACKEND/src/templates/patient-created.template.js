const patientCreatedTemplate = ({ patientName, email, temporaryPassword }) => {
  return `
    <div style="font-family: Arial, sans-serif;">

      <h2>
        Welcome to HMS
      </h2>

      <p>
        Dear ${patientName},
      </p>

      <p>
        Your patient account has been created successfully.
      </p>

      <p>
        <strong>Email:</strong>
        ${email}
      </p>

      <p>
        <strong>Temporary Password:</strong>
        ${temporaryPassword}
      </p>

      <p>
        Please login using the temporary password and create a new password on first login.
      </p>

      <br>

      <p>
        Regards,<br>
        HMS Team
      </p>

    </div>
  `;
};

module.exports = patientCreatedTemplate;
