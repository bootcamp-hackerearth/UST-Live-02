const appointmentApprovedTemplate = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  tokenNumber,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      
      <h2 style="color: #16a34a;">
        Appointment Approved
      </h2>

      <p>
        Hello ${patientName},
      </p>

      <p>
        Your appointment request has been approved.
      </p>

      <p>
        <strong>Doctor:</strong>
        ${doctorName}
      </p>

      <p>
        <strong>Date:</strong>
        ${appointmentDate}
      </p>

      <p>
        <strong>Time:</strong>
        ${appointmentTime}
      </p>

      <p>
        <strong>Token Number:</strong>
        ${tokenNumber}
      </p>

      <br/>

      <p>
        Please arrive 15 minutes before your appointment.
      </p>

      <br/>

      <p>Regards,</p>
      <p>HMS Team</p>

    </div>
  `;
};

module.exports = appointmentApprovedTemplate;
