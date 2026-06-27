const Employee = require("../../models/Employee");
const User = require("../../models/User");
const Appointment = require("../../models/Appointment");
const STATUS = require("../../constants/status");
const ERR = require("../../utils/errors");
const sendEmail = require("../../utils/sendEmail");
const doctorUnavailableAppointmentCancelledTemplate = require("../../templates/doctor-unavailable-appointment-cancelled.template");

const ACTIVE_APPOINTMENT_STATUSES = [
  STATUS.PENDING,
  STATUS.BOOKED,
  STATUS.IN_CONSULTATION,
];

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const notifyPatientsAndCancelAppointments = async ({
  doctor,
  deletedBy,
}) => {
  const upcomingAppointments = await Appointment.find({
    doctorEmployeeId: doctor._id,
    appointmentDate: { $gte: getStartOfToday() },
    status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    isDeleted: { $ne: true },
  }).populate("patientId", "firstName lastName email");

  for (const appointment of upcomingAppointments) {
    const patient = appointment.patientId;

    if (patient?.email) {
      await sendEmail({
        to: patient.email,
        subject: "Appointment Cancelled - Doctor Unavailable",
        htmlContent: doctorUnavailableAppointmentCancelledTemplate({
          patientName: `${patient.firstName || ""} ${
            patient.lastName || ""
          }`.trim() || "Patient",
          doctorName: doctor.name,
          appointmentDate: formatDate(appointment.appointmentDate),
          appointmentTime: appointment.timeSlot,
        }),
      });
    } else {
      console.warn(
        `Skipping appointment ${appointment.appointmentId} email because patient email is missing`
      );
    }
  }

  if (upcomingAppointments.length) {
    await Appointment.updateMany(
      {
        _id: {
          $in: upcomingAppointments.map((appointment) => appointment._id),
        },
      },
      {
        status: STATUS.CANCELLED,
        deletedBy,
        deletedDate: new Date(),
      }
    );
  }
};

const deleteEmployeeService = async (employeeId, deletedBy) => {
  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: { $ne: true },
  });

  if (!employee) {
    throw ERR.employeeNotFound();
  }

  if (employee.designation === "DOCTOR") {
    await notifyPatientsAndCancelAppointments({
      doctor: employee,
      deletedBy,
    });
  }

  employee.isDeleted = true;
  employee.deletedBy = deletedBy;
  employee.deletedDate = new Date();
  employee.status = STATUS.INACTIVE;

  await employee.save();

  await User.findOneAndUpdate(
    { employeeId },
    {
      status: STATUS.INACTIVE,
    }
  );

  return employee;
};

module.exports = deleteEmployeeService;

