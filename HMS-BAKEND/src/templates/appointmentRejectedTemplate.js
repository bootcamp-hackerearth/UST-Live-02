const appointmentRejectedTemplate = ({ patientName, appointmentId }) => {
  return `
    <div>
      <h2>Appointment Request Rejected</h2>

      <p>Dear ${patientName},</p>

      <p>
        We regret to inform you that your appointment request
        has been rejected.
      </p>

      <p>
        Appointment ID:
        <b>${appointmentId}</b>
      </p>

      <p>
        Please contact the hospital reception for further details.
      </p>

      <p>Thank you,</p>
      <p>HMS Team</p>
    </div>
  `;
};

module.exports = appointmentRejectedTemplate;
