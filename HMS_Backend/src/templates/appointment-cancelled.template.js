const appointmentCancelledTemplate = ({
  patientName,
  appointmentDate,
  appointmentTime,
  reason,
}) => {
  return `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width:600px;
        margin:auto;
        border:1px solid #e5e7eb;
        border-radius:8px;
        overflow:hidden;
      "
    >

      <div
        style="
          background:#dc2626;
          color:#fff;
          padding:20px;
          text-align:center;
        "
      >
        <h2>
          Appointment Cancelled
        </h2>
      </div>

      <div style="padding:24px;">

        <p>
          Dear
          <strong>
            ${patientName}
          </strong>,
        </p>

        <p>
          Your appointment has been cancelled because your doctor is no longer available.
        </p>

        <table
          cellpadding="8"
          cellspacing="0"
          width="100%"
          style="
            border-collapse:collapse;
            margin-top:16px;
          "
        >
          <tr>
            <td>
              Appointment Date
            </td>

            <td>
              ${appointmentDate}
            </td>
          </tr>

          <tr>
            <td>
              Appointment Time
            </td>

            <td>
              ${appointmentTime}
            </td>
          </tr>

          <tr>
            <td>
              Reason
            </td>

            <td>
              ${reason}
            </td>
          </tr>
        </table>

        <p
          style="
            margin-top:24px;
          "
        >
          Please book another appointment or contact the hospital reception.
        </p>

        <p>
          Thank you.
        </p>

      </div>

    </div>
  `;
};

module.exports = appointmentCancelledTemplate;
