const ERR = require("../../utils/errors");

const normalizeDate = (value) => {
  const date = new Date(value);

  date.setHours(0, 0, 0, 0);

  return date;
};

const formatDate = (value) => new Date(value).toISOString().split("T")[0];

const ensureDoctorJoined = (doctor, appointmentDate) => {
  if (!doctor?.joiningDate) {
    return;
  }

  const selectedDate = normalizeDate(appointmentDate);
  const joiningDate = normalizeDate(doctor.joiningDate);

  if (selectedDate < joiningDate) {
    throw ERR.doctorNotJoined(formatDate(doctor.joiningDate));
  }
};

module.exports = ensureDoctorJoined;
