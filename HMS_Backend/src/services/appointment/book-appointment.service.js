const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const getNextTokenNumber = require("../../utils/getNextTokenNumber");
const generateAppointmentId = require("../../utils/generateAppointmentId");
const generateSlots = require("../../utils/generateSlots");
const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");

const HOSPITAL_TIME_ZONE = process.env.HOSPITAL_TIME_ZONE || "Asia/Kolkata";

const hospitalDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: HOSPITAL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const hospitalDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: HOSPITAL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const getFormatterParts = (formatter, date) =>
  Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

const formatHospitalDateKey = (date) => {
  const parts = getFormatterParts(hospitalDateFormatter, date);

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const getAppointmentDateRange = (appointmentDate, useNoon = true) => {
  if (!useNoon) {
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return {
      normalizedDate: startOfDay,
      nextDay: endOfDay,
    };
  }

  const [year, month, day] = appointmentDate.split("-").map(Number);
  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);
  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return {
    normalizedDate,
    nextDay,
  };
};

const assertFutureAppointmentDate = (appointmentDate, message) => {
  const selectedDate = new Date(appointmentDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new ApiError(422, message, "PAST_DATE_NOT_ALLOWED");
  }
};

const getAppointmentDateKey = (appointmentDate) => {
  if (typeof appointmentDate === "string") {
    return appointmentDate.split("T")[0];
  }

  return formatHospitalDateKey(new Date(appointmentDate));
};

const getCurrentHospitalTime = () => {
  const now = getFormatterParts(hospitalDateTimeFormatter, new Date());

  return {
    dateKey: `${now.year}-${now.month}-${now.day}`,
    minutes: Number(now.hour) * 60 + Number(now.minute),
  };
};

const getSlotMinutes = (slot) => {
  const [hours, minutes] = String(slot).split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

const isPastAppointmentSlot = (appointmentDate, appointmentTime) => {
  const slotMinutes = getSlotMinutes(appointmentTime);

  if (slotMinutes === null) {
    return false;
  }

  const now = getCurrentHospitalTime();

  return getAppointmentDateKey(appointmentDate) === now.dateKey &&
    slotMinutes <= now.minutes;
};

const filterFutureSlotsForDate = (slots, appointmentDate) =>
  slots.filter((slot) => !isPastAppointmentSlot(appointmentDate, slot));

const assertFutureAppointmentTime = (appointmentDate, appointmentTime) => {
  if (isPastAppointmentSlot(appointmentDate, appointmentTime)) {
    throw new ApiError(
      422,
      "Cannot book appointment for a past time slot",
      "PAST_TIME_NOT_ALLOWED",
    );
  }
};

const getDateOnly = (date) => {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  return dateOnly;
};

const findActivePatient = async (patientId) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  return patient;
};

const findActiveDoctor = async (doctorId) => {
  const doctor = await Employee.findOne({
    _id: doctorId,
    isDeleted: false,
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found", "DOCTOR_NOT_FOUND");
  }

  return doctor;
};

const assertDoctorJoined = (doctor, appointmentDate) => {
  if (!doctor?.joiningDate) {
    return;
  }

  if (getDateOnly(appointmentDate) < getDateOnly(doctor.joiningDate)) {
    throw new ApiError(
      400,
      "Doctor is not available before joining date",
      "DOCTOR_NOT_JOINED_YET",
    );
  }
};

const assertDoctorCanWork = (doctor, appointmentDate) => {
  assertDoctorJoined(doctor, appointmentDate);

  if (!doctor?.availability?.isAvailable) {
    throw new ApiError(
      400,
      "Doctor is currently unavailable",
      "DOCTOR_UNAVAILABLE",
    );
  }

  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();

  if (!doctor?.availability?.workingDays?.includes(appointmentDay)) {
    throw new ApiError(
      400,
      `Doctor is not available on ${appointmentDay}`,
      "DOCTOR_NOT_AVAILABLE_ON_DAY",
    );
  }
};

const assertDoctorHasSchedule = (doctor) => {
  if (
    !doctor?.availability?.startTime ||
    !doctor?.availability?.endTime ||
    !doctor?.availability?.slotDuration
  ) {
    throw new ApiError(
      400,
      "Doctor availability schedule is incomplete",
      "DOCTOR_SCHEDULE_INCOMPLETE",
    );
  }
};

const assertSlotOutsideBreak = (doctor, appointmentTime) => {
  const breakStartTime = doctor?.availability?.breakStartTime;
  const breakEndTime = doctor?.availability?.breakEndTime;

  if (
    breakStartTime &&
    breakEndTime &&
    appointmentTime >= breakStartTime &&
    appointmentTime < breakEndTime
  ) {
    throw new ApiError(
      400,
      "Selected slot falls during doctor break time",
      "SLOT_DURING_BREAK_TIME",
    );
  }
};

const assertValidGeneratedSlot = (doctor, appointmentTime) => {
  assertDoctorHasSchedule(doctor);

  const validSlots = generateSlots(
    doctor.availability.startTime,
    doctor.availability.endTime,
    doctor.availability.slotDuration,
    doctor.availability.breakStartTime,
    doctor.availability.breakEndTime,
  );

  if (!validSlots.includes(appointmentTime)) {
    throw new ApiError(
      400,
      "Selected slot is not part of the doctor's available schedule",
      "INVALID_APPOINTMENT_SLOT",
    );
  }
};

const assertDoctorDailyLimit = async (doctor, doctorId, dateRange) => {
  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId: doctorId,
    appointmentDate: {
      $gte: dateRange.normalizedDate,
      $lt: dateRange.nextDay,
    },
    status: {
      $ne: STATUS.CANCELLED,
    },
    isDeleted: false,
  });

  if (totalAppointments >= doctor?.availability?.maxPatientsPerDay) {
    throw new ApiError(
      400,
      "Maximum patient limit reached for this doctor",
      "DOCTOR_DAILY_LIMIT_REACHED",
    );
  }
};

const assertDoctorSlotAvailable = async (doctorId, appointmentTime, dateRange) => {
  const existingAppointment = await Appointment.findOne({
    doctorEmployeeId: doctorId,
    timeSlot: appointmentTime,
    appointmentDate: {
      $gte: dateRange.normalizedDate,
      $lt: dateRange.nextDay,
    },
    status: {
      $nin: [STATUS.CANCELLED, STATUS.NO_SHOW],
    },
    isDeleted: false,
  });

  if (existingAppointment) {
    throw new ApiError(
      409,
      "Selected slot already booked",
      "SLOT_ALREADY_BOOKED",
    );
  }
};

const assertPatientSlotAvailable = async ({
  patientId,
  appointmentTime,
  dateRange,
  includeDeletedFilter,
}) => {
  const patientConflictFilter = {
    patientId,
    timeSlot: appointmentTime,
    appointmentDate: {
      $gte: dateRange.normalizedDate,
      $lt: dateRange.nextDay,
    },
    status: {
      $nin: [STATUS.CANCELLED, STATUS.NO_SHOW],
    },
  };

  if (includeDeletedFilter) {
    patientConflictFilter.isDeleted = false;
  }

  const existingPatientAppointment =
    await Appointment.findOne(patientConflictFilter);

  if (existingPatientAppointment) {
    throw new ApiError(
      409,
      "Patient already has an appointment at this time",
      "PATIENT_APPOINTMENT_CONFLICT",
    );
  }
};

const prepareAppointmentBooking = async ({
  patientId,
  doctorId,
  appointmentDate,
  appointmentTime,
  includePatientDeletedFilter = false,
}) => {
  assertFutureAppointmentDate(
    appointmentDate,
    "Cannot book appointment for past dates",
  );
  assertFutureAppointmentTime(appointmentDate, appointmentTime);

  await findActivePatient(patientId);
  const doctor = await findActiveDoctor(doctorId);
  assertDoctorCanWork(doctor, appointmentDate);
  assertSlotOutsideBreak(doctor, appointmentTime);
  assertValidGeneratedSlot(doctor, appointmentTime);

  const dateRange = getAppointmentDateRange(appointmentDate);

  await assertDoctorDailyLimit(doctor, doctorId, dateRange);
  await assertDoctorSlotAvailable(doctorId, appointmentTime, dateRange);
  await assertPatientSlotAvailable({
    patientId,
    appointmentTime,
    dateRange,
    includeDeletedFilter: includePatientDeletedFilter,
  });

  return {
    dateRange,
    doctor,
  };
};

const buildAppointmentPayload = ({
  appointmentData,
  patientId,
  appointmentId,
  tokenNumber,
  createdBy,
  status,
}) => ({
  appointmentId,
  patientId,
  doctorEmployeeId: appointmentData.doctorId,
  appointmentDate: appointmentData.appointmentDate,
  timeSlot: appointmentData.appointmentTime,
  appointmentType: appointmentData.appointmentType,
  priority: appointmentData.priority,
  paymentStatus: appointmentData.paymentStatus,
  visitMode: appointmentData.visitMode,
  symptoms: appointmentData.symptoms,
  reason: appointmentData.reason,
  notes: appointmentData.notes,
  tokenNumber,
  status,
  ...createdBy,
});

const createAppointmentRecord = async ({
  appointmentData,
  patientId,
  tokenNumber,
  createdBy,
  status,
}) => {
  const appointmentId = await generateAppointmentId();

  return Appointment.create(
    buildAppointmentPayload({
      appointmentData,
      patientId,
      appointmentId,
      tokenNumber,
      createdBy,
      status,
    }),
  );
};

const bookAppointment = async (appointmentData, user) => {
  const { patientId, doctorId, appointmentDate, appointmentTime } =
    appointmentData;

  await prepareAppointmentBooking({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
  });

  const tokenNumber = await getNextTokenNumber(doctorId, appointmentDate);

  return createAppointmentRecord({
    appointmentData,
    patientId,
    tokenNumber,
    createdBy: {
      createdByEmployeeId: user.employeeId,
    },
    status: STATUS.BOOKED,
  });
};

bookAppointment.assertDoctorCanWork = assertDoctorCanWork;
bookAppointment.assertFutureAppointmentDate = assertFutureAppointmentDate;
bookAppointment.assertFutureAppointmentTime = assertFutureAppointmentTime;
bookAppointment.assertSlotOutsideBreak = assertSlotOutsideBreak;
bookAppointment.assertValidGeneratedSlot = assertValidGeneratedSlot;
bookAppointment.createAppointmentRecord = createAppointmentRecord;
bookAppointment.filterFutureSlotsForDate = filterFutureSlotsForDate;
bookAppointment.findActiveDoctor = findActiveDoctor;
bookAppointment.getAppointmentDateRange = getAppointmentDateRange;
bookAppointment.prepareAppointmentBooking = prepareAppointmentBooking;

module.exports = bookAppointment;
