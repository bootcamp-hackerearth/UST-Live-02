const Appointment =require("../../models/Appointment");

const getMyAppointments =
async (
  patientId
) => {
return Appointment.find({
    patientId,
  }).populate({
  path: "doctorEmployeeId",
  select: "name department specialization",
})
    .sort({
      appointmentDate: -1,
    });
};

module.exports = getMyAppointments;