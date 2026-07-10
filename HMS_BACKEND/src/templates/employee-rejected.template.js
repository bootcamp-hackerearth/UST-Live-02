const employeeRejectedTemplate = ({
  name,
  department,
  designation,
  rejectionReason,
}) => {
  const reasonSection = rejectionReason
    ? `
      <p>
        <strong>Reason:</strong>
        ${rejectionReason}
      </p>
    `
    : "";

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #64748b;">Employee Registration Rejected</h2>

      <p>Hello ${name},</p>

      <p>Your HMS employee registration request could not be approved at this time.</p>

      <p>
        <strong>Department:</strong>
        ${department}
      </p>

      <p>
        <strong>Designation:</strong>
        ${designation}
      </p>

      ${reasonSection}

      <br/>

      <p>Please contact the hospital administration for further details.</p>

      <br/>

      <p>Regards,</p>
      <p>HMS Team</p>
    </div>
  `;
};

module.exports = employeeRejectedTemplate;
