const Appointment = require("../models/Appointment.model");
const Patient = require("../models/Patient.model");
const Employee = require("../models/Employee.model");
const ApiError = require("../utils/ApiError");
const Doctor = require("../models/Doctor.model");
const sendMail = require("./mail.service");

const parseTime = (timeStr) => {
  const [time, period] = timeStr.split(" ");

  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

const isToday = (appointmentDate) => {
  const today = new Date();
  const selectedDate = new Date(appointmentDate);

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  return today.getTime() === selectedDate.getTime();
};

const removePastSlotsForToday = (slots, appointmentDate) => {
  if (!isToday(appointmentDate)) {
    return slots;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.filter((slot) => {
    const slotMinutes = parseTime(slot);

    return slotMinutes > currentMinutes;
  });
};

const generateTimeSlots = (startTime, endTime) => {
  const slots = [];

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const formatTime = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Determine AM or PM
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12 hour format
    if (hours === 0)
      hours = 12; // midnight
    else if (hours > 12) hours -= 12; // 13 → 1, 14 → 2 etc

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);

  for (let i = startMinutes; i < endMinutes; i += 30) {
    slots.push(formatTime(i));
  }

  return slots;
};

exports.createAppointment = async (
  appointmentData,
  loggedInUserId,
  loggedInUserRole,
) => {
  const { patientId, doctorId, appointmentDate, timeSlot, reason } =
    appointmentData;

  let finalPatientId = patientId;
  console.log("Patient id : ", patientId);
  if (!finalPatientId && loggedInUserRole === "Patient") {
    const loggedInPatient = await Patient.findOne({ userId: loggedInUserId });
    if (!loggedInPatient) throw new ApiError(404, "Patient profile not found");
    finalPatientId = loggedInPatient._id;
  }

  if (!finalPatientId) throw new ApiError(400, "Patient is required");

  const patient = await Patient.findById(finalPatientId);
  if (!patient) throw new ApiError(404, "Patient not found");

  const employeeRecord = await Employee.findById(doctorId).populate({
    path: "userId",
    populate: { path: "roleId" },
  });

  if (!employeeRecord) throw new ApiError(404, "Doctor not found");

  if (employeeRecord.userId?.roleId?.name !== "Doctor") {
    throw new ApiError(400, "Selected employee is not a doctor");
  }

  const appointmentDateObj = new Date(appointmentDate);
  appointmentDateObj.setHours(0, 0, 0, 0);

  const joiningDateObj = new Date(employeeRecord.joiningDate);
  joiningDateObj.setHours(0, 0, 0, 0);

  if (appointmentDateObj < joiningDateObj) {
    throw new ApiError(
      400,
      `Doctor is not yet joined. Appointments can only be booked on or after ${joiningDateObj.toISOString().split("T")[0]}`,
    );
  }

  const doctor = await Doctor.findOne({ employeeId: doctorId });
  if (!doctor) throw new ApiError(404, "Doctor profile not found"); // ✅ throw if not found

  const availableSlots = generateTimeSlots(
    doctor.availabilityStartTime,
    doctor.availabilityEndTime,
  );

  if (!availableSlots.includes(timeSlot)) {
    throw new ApiError(
      400,
      `Doctor is only available from ${doctor.availabilityStartTime} to ${doctor.availabilityEndTime}`,
    );
  }

  // Prevent booking past slots for today

  if (isToday(appointmentDate)) {
    const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const selectedSlotMinutes = parseTime(timeSlot);

    if (selectedSlotMinutes <= currentMinutes) {
      throw new ApiError(400, "Cannot book a past time slot for today");
    }
  }

  const existingAppointment = await Appointment.findOne({
    doctorId: doctor._id,
    appointmentDate,
    timeSlot,
    status: "BOOKED",
  });

  if (existingAppointment) {
    throw new ApiError(
      409,
      "Doctor already has an appointment in this time slot",
    );
  }

  const appointment = await Appointment.create({
    patientId: finalPatientId,
    doctorId: doctor._id,
    appointmentDate,
    timeSlot,
    reason,
    createdBy: loggedInUserId,
  });
  const pat = await Patient.findById(finalPatientId).populate({
    path: "userId",
    select: "firstName lastName email",
  });

  const doctorDetails = await Doctor.findById(doctor._id).populate({
    path: "employeeId",
    populate: {
      path: "userId",
      select: "firstName lastName email",
    },
  });

  console.log("-------------patient--------- : ", pat);

  const patientName = `${pat?.userId?.firstName || ""} ${pat?.userId?.lastName || ""}`;

  const email = pat?.userId?.email;

  const doctorName = `Dr. ${doctorDetails?.employeeId?.userId?.firstName || ""} ${
    doctorDetails?.employeeId?.userId?.lastName || ""
  }`;

  const formattedDate = new Date(appointmentDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; padding:20px;">

    <h2 style="color:#16a34a;">
        Appointment Confirmed ✅
    </h2>

    <p>Hello <strong>${patientName}</strong>,</p>

    <p>
        Your appointment has been successfully booked.
    </p>

    <table
        style="
        border-collapse: collapse;
        width: 100%;
        max-width: 600px;
        margin-top: 15px;
        "
    >

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Appointment ID
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${appointment.appointmentCode}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Patient Name
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${patientName}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Doctor
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${doctorName}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Date
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${formattedDate}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Time Slot
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${timeSlot}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Reason
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${reason}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Status
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            BOOKED
        </td>
        </tr>

    </table>

    <p style="margin-top:20px;">
        Please arrive at least 15 minutes before your scheduled appointment.
    </p>

    <p>
        Regards,<br/>
        <strong>Hospital Management System</strong>
    </p>

    </div>
    `;

  console.log("appointment created");
  sendMail(email, "Appointment Confirmation ✅", html);

  return appointment;
};
exports.getAppointments = async () => {
  const appointments = await Appointment.find()
    .populate("patientId")
    .populate({
      path: "doctorId",
      populate: {
        path: "employeeId",
        populate: {
          path: "userId",
          select: "firstName lastName email",
        },
      },
    })
    .populate("createdBy", "firstName lastName email")
    .sort({ createdAt: -1 });

  console.log(
    "doctorId sample:",
    JSON.stringify(appointments[0]?.doctorId, null, 2),
  );

  return appointments;
};
exports.getMyAppointments = async (user) => {
  const { userId, rolecode } = user;

  if (!["DOC", "PAT"].includes(rolecode)) {
    throw new ApiError(
      403,
      "Only patients and doctors can access my appointments",
    );
  }

  if (rolecode === "DOC") {
    const employee = await Employee.findOne({ userId });
    if (!employee) throw new ApiError(404, "Employee profile not found");

    const doctor = await Doctor.findOne({ employeeId: employee._id });
    if (!doctor) throw new ApiError(404, "Doctor profile not found");

    return await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "UHID firstName lastName phone gender bloodGroup")
      .populate({
        path: "doctorId",
        populate: {
          path: "employeeId",
          populate: {
            path: "userId",
            select: "firstName lastName email",
          },
        },
      })
      .sort({ appointmentDate: -1 });
  }

  if (rolecode === "PAT") {
    const patient = await Patient.findOne({ userId });
    if (!patient) throw new ApiError(404, "Patient profile not found");

    return await Appointment.find({ patientId: patient._id })
      .populate("patientId", "UHID firstName lastName phone gender bloodGroup")
      .populate({
        path: "doctorId",
        populate: {
          path: "employeeId",
          populate: {
            path: "userId",
            select: "firstName lastName email",
          },
        },
      })
      .sort({ appointmentDate: -1 });
  }
};

exports.getAvailableSlots = async (doctorId, appointmentDate) => {
  const doctor = await Doctor.findOne({
    employeeId: doctorId,
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const originalSlots = generateTimeSlots(
    doctor.availabilityStartTime,
    doctor.availabilityEndTime,
  );

  const visibleSlots = removePastSlotsForToday(originalSlots, appointmentDate);

  const bookedAppointments = await Appointment.find({
    doctorId: doctor._id,
    appointmentDate,
    status: "BOOKED",
  }).select("timeSlot");

  const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);

  const availableSlots = visibleSlots.filter(
    (slot) => !bookedSlots.includes(slot),
  );

  return {
    availabilityStart: doctor.availabilityStartTime,

    availabilityEnd: doctor.availabilityEndTime,

    totalSlots: visibleSlots.length,

    bookedCount: bookedSlots.length,

    allSlots: visibleSlots,

    bookedSlots,

    availableSlots,
  };
};

exports.cancelAppointment = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (appointment.status === "CANCELLED") {
    throw new ApiError(400, "Appointment is already cancelled");
  }

  if (appointment.status === "COMPLETED") {
    throw new ApiError(400, "Completed appointment cannot be cancelled");
  }

  const appointmentDate = new Date(appointment.appointmentDate);
  appointmentDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (appointmentDate < today) {
    throw new ApiError(400, "Past appointments cannot be cancelled");
  }

  appointment.status = "CANCELLED";
  await appointment.save();

  const patient = await Patient.findById(appointment.patientId).populate({
    path: "userId",
    select: "firstName lastName email",
  });

  const doctor = await Doctor.findById(appointment.doctorId).populate({
    path: "employeeId",
    populate: {
      path: "userId",
      select: "firstName lastName",
    },
  });

  const patientName = `${patient?.userId?.firstName || ""} ${patient?.userId?.lastName || ""}`;

  const email = patient?.userId?.email;

  const doctorName = `Dr. ${doctor?.employeeId?.userId?.firstName || ""} ${
    doctor?.employeeId?.userId?.lastName || ""
  }`;

  const formattedDate = new Date(
    appointment.appointmentDate,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; padding:20px;">

    <h2 style="color:#dc2626;">
        Appointment Cancelled ❌
    </h2>

    <p>Hello <strong>${patientName}</strong>,</p>

    <p>
        Your appointment has been cancelled.
    </p>

    <table
        style="
        border-collapse: collapse;
        width: 100%;
        max-width: 600px;
        margin-top: 15px;
        "
    >

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Appointment ID
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${appointment.appointmentCode}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Patient Name
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${patientName}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Doctor
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${doctorName}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Date
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${formattedDate}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Time Slot
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${appointment.timeSlot}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Reason
        </td>
        <td style="padding:8px;border:1px solid #ddd;">
            ${appointment.reason}
        </td>
        </tr>

        <tr>
        <td style="padding:8px;border:1px solid #ddd;">
            Status
        </td>
        <td style="padding:8px;border:1px solid #ddd;color:#dc2626;font-weight:bold;">
            CANCELLED
        </td>
        </tr>

    </table>

    <p style="margin-top:20px;">
        If you still require a consultation, please contact the hospital to schedule another appointment.
    </p>

    <p>
        Regards,<br/>
        <strong>Hospital Management System</strong>
    </p>

    </div>
    `;

  try {
    await sendMail(email, "Appointment Cancelled ❌", html);
  } catch (error) {
    console.error("Failed to send cancellation email:", error.message);
  }

  return appointment;
};
