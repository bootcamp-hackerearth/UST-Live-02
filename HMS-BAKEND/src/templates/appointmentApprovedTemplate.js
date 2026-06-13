const appointmentApprovedTemplate = ({
  patientName,
  appointmentId,
  appointmentDate,
  timeSlot,
  doctorName,
}) => {
  return `
    <div>
      <h2>Appointment Approved</h2>

      <p>Dear ${patientName},</p>

      <p>
        Your appointment request has been approved successfully.
      </p>

      <table border="1" cellpadding="8">
        <tr>
          <td><b>Appointment ID</b></td>
          <td>${appointmentId}</td>
        </tr>

        <tr>
          <td><b>Date</b></td>
          <td>${appointmentDate}</td>
        </tr>

        <tr>
          <td><b>Time Slot</b></td>
          <td>${timeSlot}</td>
        </tr>

        <tr>
          <td><b>Doctor</b></td>
          <td>${doctorName}</td>
        </tr>
      </table>

      <p>
        Please arrive 15 minutes before your scheduled appointment.
      </p>

      <p>Thank you,</p>
      <p>HMS Team</p>
    </div>
  `;
};

module.exports = appointmentApprovedTemplate;
