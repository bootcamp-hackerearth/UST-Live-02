const appointmentRejectedTemplate = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">

      <h2 style="color: #dc2626;">
        Appointment Rejected
      </h2>

      <p>
        Hello ${patientName},
      </p>

      <p>
        Unfortunately your appointment request could not be approved.
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

      <br/>

      <p>
        Please choose another slot or contact the hospital.
      </p>

      <br/>

      <p>Regards,</p>
      <p>HMS Team</p>

    </div>
  `;
};

module.exports = appointmentRejectedTemplate;
