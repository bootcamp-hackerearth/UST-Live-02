const doctorUnavailableAppointmentCancelledTemplate = ({
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
}) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
      <h2 style="color: #dc2626;">Appointment Cancelled</h2>

      <p>Hello ${patientName},</p>

      <p>
        We are sorry to inform you that your appointment with
        <strong>Dr. ${doctorName}</strong> has been cancelled because the doctor
        is no longer available.
      </p>

      <p><strong>Date:</strong> ${appointmentDate}</p>
      <p><strong>Time:</strong> ${appointmentTime}</p>

      <p>
        Please book another appointment with an available doctor.
        We apologize for the inconvenience.
      </p>

      <br />

      <p>Regards,</p>
      <p>HMS Team</p>
    </div>
  `;
};

module.exports = doctorUnavailableAppointmentCancelledTemplate;
