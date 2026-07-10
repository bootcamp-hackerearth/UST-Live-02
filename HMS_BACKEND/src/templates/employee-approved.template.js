const employeeApprovedTemplate = ({
  name,
  email,
  employeeCode,
  department,
  designation,
  consultationFee,
}) => {
  const doctorFeeSection = consultationFee
    ? `
      <p>
        <strong>Consultation Fee:</strong>
        ${consultationFee}
      </p>
    `
    : "";

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #16a34a;">Employee Registration Approved</h2>

      <p>Hello ${name},</p>

      <p>Your HMS employee registration has been approved. You can now sign in and access the modules assigned to your role.</p>

      <p>
        <strong>Login Email:</strong>
        ${email}
      </p>

      <p>
        <strong>Employee Code:</strong>
        ${employeeCode}
      </p>

      <p>
        <strong>Department:</strong>
        ${department}
      </p>

      <p>
        <strong>Designation:</strong>
        ${designation}
      </p>

      ${doctorFeeSection}

      <br/>

      <p>Regards,</p>
      <p>HMS Team</p>
    </div>
  `;
};

module.exports = employeeApprovedTemplate;
