const Appointment = require('../models/Appointment.model');
const Patient = require('../models/Patient.model');
const Employee = require('../models/Employee.model');
const ApiError = require('../utils/ApiError');
const Doctor = require('../models/Doctor.model')


const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
};


const generateTimeSlots = (startTime, endTime) => {
    const slots = [];


    const formatTime = (totalMinutes) => {
        let hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Determine AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12 hour format
        if (hours === 0) hours = 12;        // midnight
        else if (hours > 12) hours -= 12;   // 13 → 1, 14 → 2 etc

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    for (let i = startMinutes; i < endMinutes; i += 30) {
        slots.push(formatTime(i));
    }

    return slots;
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


const getFinalPatientId = async (patientId, loggedInUserId, loggedInUserRole) => {
    if (patientId || loggedInUserRole !== 'Patient') {
        return patientId;
    }

    const loggedInPatient = await Patient.findOne({ userId: loggedInUserId });

    if (!loggedInPatient) {
        throw new ApiError(404, 'Patient profile not found');
    }

    return loggedInPatient._id;
};

const validateTodaySlot = (appointmentDate, timeSlot) => {
    if (!isToday(appointmentDate)) {
        return;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const selectedSlotMinutes = parseTime(timeSlot);

    if (selectedSlotMinutes <= currentMinutes) {
        throw new ApiError(400, 'Cannot book a past time slot for today');
    }
};

exports.createAppointment = async (appointmentData, loggedInUserId, loggedInUserRole) => {
    const {
        patientId,
        doctorId,
        appointmentDate,
        timeSlot,
        reason
    } = appointmentData;

    const finalPatientId = await getFinalPatientId(
        patientId,
        loggedInUserId,
        loggedInUserRole
    );

    if (!finalPatientId) throw new ApiError(400, 'Patient is required');

    const patient = await Patient.findById(finalPatientId);
    if (!patient) throw new ApiError(404, 'Patient not found');

    const employeeRecord = await Employee.findById(doctorId).populate({
        path: 'userId',
        populate: { path: 'roleId' }
    });

    if (!employeeRecord) throw new ApiError(404, 'Doctor not found');

    if (employeeRecord.userId?.roleId?.name !== 'Doctor') {
        throw new ApiError(400, 'Selected employee is not a doctor');
    }

    const appointmentDateObj = new Date(appointmentDate);
    appointmentDateObj.setHours(0, 0, 0, 0);

    const joiningDateObj = new Date(employeeRecord.joiningDate);
    joiningDateObj.setHours(0, 0, 0, 0);

    if (appointmentDateObj < joiningDateObj) {
        throw new ApiError(
            400,
            `Doctor is not yet joined. Appointments can only be booked on or after ${joiningDateObj.toISOString().split('T')[0]}`
        );
    }

    const doctor = await Doctor.findOne({ employeeId: doctorId });
    if (!doctor) throw new ApiError(404, 'Doctor profile not found'); // ✅ throw if not found

    const availableSlots = generateTimeSlots(
        doctor.availabilityStartTime,
        doctor.availabilityEndTime
    );

    if (!availableSlots.includes(timeSlot)) {
        throw new ApiError(400,
            `Doctor is only available from ${doctor.availabilityStartTime} to ${doctor.availabilityEndTime}`
        );
    }
    validateTodaySlot(appointmentDate, timeSlot);
    const existingAppointment = await Appointment.findOne({
        doctorId: doctor._id,
        appointmentDate,
        timeSlot,
        status: 'BOOKED'
    });

    if (existingAppointment) {
        throw new ApiError(409, 'Doctor already has an appointment in this time slot');
    }

    const patientExistingAppointment = await Appointment.findOne({
        patientId: finalPatientId,
        appointmentDate,
        timeSlot,
        status: 'BOOKED'
    });

    if (patientExistingAppointment) {
        throw new ApiError(
            409,
            'Patient already has an appointment at this time slot'
        );
    }
    const appointment = await Appointment.create({
        patientId: finalPatientId,
        doctorId: doctor._id,
        appointmentDate,
        timeSlot,
        reason,
        createdBy: loggedInUserId
    });

    return appointment;
};
exports.getAppointments = async () => {
    const appointments = await Appointment.find()
        .populate('patientId')
        .populate({
            path: 'doctorId',
            populate: {
                path: 'employeeId',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName email'
                }
            }
        })
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 });

    console.log('doctorId sample:', JSON.stringify(appointments[0]?.doctorId, null, 2));

    return appointments;
};
exports.getMyAppointments = async (user) => {
    const { userId, rolecode } = user;

    if (!['DOC', 'PAT'].includes(rolecode)) {
        throw new ApiError(403, 'Only patients and doctors can access my appointments');
    }

    if (rolecode === 'DOC') {
        const employee = await Employee.findOne({ userId });
        if (!employee) throw new ApiError(404, 'Employee profile not found');

        const doctor = await Doctor.findOne({ employeeId: employee._id });
        if (!doctor) throw new ApiError(404, 'Doctor profile not found');

        return await Appointment.find({ doctorId: doctor._id })
            .populate('patientId', 'UHID firstName lastName phone gender bloodGroup')
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'employeeId',
                    populate: {
                        path: 'userId',
                        select: 'firstName lastName email'
                    }
                }
            })
            .sort({ appointmentDate: -1 });
    }

    if (rolecode === 'PAT') {
        const patient = await Patient.findOne({ userId });
        if (!patient) throw new ApiError(404, 'Patient profile not found');

        return await Appointment.find({ patientId: patient._id })
            .populate('patientId', 'UHID firstName lastName phone gender bloodGroup')
            .populate({
                path: 'doctorId',
                populate: {
                    path: 'employeeId',
                    populate: {
                        path: 'userId',
                        select: 'firstName lastName email'
                    }
                }
            })
            .sort({ appointmentDate: -1 });
    }
};

exports.getAvailableSlots = async (doctorId, appointmentDate) => {
    // doctorId here is employeeId from the frontend
    const doctor = await Doctor.findOne({ employeeId: doctorId });
    if (!doctor) throw new ApiError(404, 'Doctor not found');

    let allSlots = generateTimeSlots(
        doctor.availabilityStartTime,
        doctor.availabilityEndTime
    );
    allSlots = removePastSlotsForToday(allSlots, appointmentDate);
    const bookedAppointments = await Appointment.find({
        doctorId: doctor._id,
        appointmentDate,
        status: 'BOOKED'
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    return {
        availabilityStart: doctor.availabilityStartTime,
        availabilityEnd: doctor.availabilityEndTime,
        totalSlots: allSlots.length,
        bookedCount: bookedSlots.length,
        availableSlots
    };
};

exports.cancelAppointment = async (appointmentId) => {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (appointment.status === 'CANCELLED') {
        throw new ApiError(400, 'Appointment is already cancelled');
    }

    if (appointment.status === 'COMPLETED') {
        throw new ApiError(400, 'Completed appointment cannot be cancelled');
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
        throw new ApiError(400, 'Past appointments cannot be cancelled');
    }

    appointment.status = 'CANCELLED';
    await appointment.save();

    return appointment;
};