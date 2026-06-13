const pendingApprovalTemplate = ({
  name,
  email,
  designation,
  department,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Employee Registration</h2>

      <p>
        A new employee has registered in HMS and is waiting for approval.
      </p>

      <hr />

      <p>
        <strong>Name:</strong>
        ${name}
      </p>

      <p>
        <strong>Email:</strong>
        ${email}
      </p>

      <p>
        <strong>Designation:</strong>
        ${designation}
      </p>

      <p>
        <strong>Department:</strong>
        ${department}
      </p>

      <br />

      <p>
        Please review the employee registration.
      </p>

      <br />

      <p>HMS System</p>
    </div>
  `;
};

module.exports = pendingApprovalTemplate;