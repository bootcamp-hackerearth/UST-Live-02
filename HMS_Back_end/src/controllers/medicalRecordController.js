const MedicalRecord = require("../models/MedicalRecords");
const Appointment = require("../models/Appointments");
const Patient = require("../models/Patients");
const Employee = require("../models/Employees");
const recordAudit = require("../utils/recordAudit");
const resolveActor = require("../utils/resolveActor");
const emailTemplates = require("../utils/emailTemplates");
const sendAppointmentEmail = require("../utils/sendAppointmentEmail");
const slotInstantMs = require("../utils/slotInstantMs");
const buildMedicalRecordFilter = require("../utils/buildMedicalRecordFilter");
const paginateMedicalRecords = require("../utils/paginateMedicalRecords");
const hasFieldChanges = require("../utils/hasFieldChanges");
const AppError = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const STATUS = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");

// Whether an actor's designation is a clinician (the only role that can finalize)
const isDoctorActor = (actor) => actor.designation === "DOCTOR";

// Create a medical record for an appointment.
// Doctors may save as DRAFT or FINALIZED; Admin/Owner/Receptionist may only save DRAFT.
exports.createMedicalRecord = async (req, res) => {

    const {
        appointmentId,
        symptoms,
        diagnosis,
        prescriptionItems,
        notes,
        status
    } = req.body;

    const actor = await resolveActor(req.user);
    const doctorRole = isDoctorActor(actor);

    const appointment = await Appointment.findOne({ appointmentId });

    if (!appointment) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.APPOINTMENT.NOT_FOUND);
    }

    // No records for cancelled/unattended appointments
    if (appointment.status === "CANCELED" || appointment.status === "UNATTENDED") {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.MEDICAL_RECORD.APPOINTMENT_NOT_ELIGIBLE);
    }

    // A doctor can only create records for their own appointments
    if (doctorRole && appointment.doctorEmployeeId !== req.user.employeeCode) {
        throw new AppError(STATUS.FORBIDDEN, MESSAGES.MEDICAL_RECORD.OWN_ONLY);
    }

    // Exactly one (non-deleted) record per appointment
    const existing = await MedicalRecord.findOne({
        appointmentId,
        isDeleted: { $ne: true }
    });

    if (existing) {
        throw new AppError(STATUS.CONFLICT, MESSAGES.MEDICAL_RECORD.ALREADY_EXISTS);
    }

    // A record can only be generated after the appointment start time (Asia/Kolkata)
    const slotStart = (appointment.timeSlot || "").split("-")[0];
    const startMs = slotInstantMs(appointment.appointmentDate, slotStart);
    if (!Number.isNaN(startMs) && startMs > Date.now()) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.MEDICAL_RECORD.CANNOT_BEFORE_START);
    }

    // Resolve denormalized display details
    const [patient, doctor] = await Promise.all([
        Patient.findOne({ UHID: appointment.patientId }).select("UHID name email"),
        Employee.findOne({ employeeCode: appointment.doctorEmployeeId }).select("employeeCode name email")
    ]);

    if (!patient) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);
    }
    if (!doctor) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.EMPLOYEE.NOT_FOUND);
    }

    // Status rules: only the assigned doctor may finalize
    let recordStatus = "DRAFT";
    if (status === "FINALIZED") {
        if (!doctorRole) {
            throw new AppError(STATUS.FORBIDDEN, MESSAGES.MEDICAL_RECORD.STAFF_CANNOT_FINALIZE);
        }
        recordStatus = "FINALIZED";
    }

    const record = new MedicalRecord({
        appointmentId,
        patientId: patient.UHID,
        patientUHID: patient.UHID,
        patientName: patient.name,
        doctorEmployeeId: doctor.employeeCode,
        doctorName: doctor.name,
        symptoms,
        diagnosis,
        prescriptionItems: prescriptionItems || [],
        notes,
        status: recordStatus,
        createdByEmployeeId: actor.employeeCode,
        createdByName: actor.name,
        createdByDesignation: actor.designation
    });

    await record.save();

    if (recordStatus === "FINALIZED") {
        // Finalizing completes the appointment
        appointment.status = "COMPLETED";
        await appointment.save();

        await sendAppointmentEmail(
            patient.email,
            emailTemplates.diagnosisReportAvailable({ patientName: patient.name })
        );

        await recordAudit({
            actor,
            action: "MEDICAL_RECORD_FINALIZED",
            targetType: "MEDICAL_RECORD",
            targetId: record.medicalRecordId,
            message: MESSAGES.AUDIT.MEDICAL_RECORD_DOCTOR_CREATED_FINALIZED(doctor.name)
        });
    } else if (doctorRole) {
        await recordAudit({
            actor,
            action: "MEDICAL_RECORD_CREATED",
            targetType: "MEDICAL_RECORD",
            targetId: record.medicalRecordId,
            message: MESSAGES.AUDIT.MEDICAL_RECORD_DOCTOR_CREATED_DRAFT(doctor.name)
        });
    } else {
        // Staff draft — assigned doctor must verify
        if (doctor.email) {
            await sendAppointmentEmail(
                doctor.email,
                emailTemplates.medicalRecordVerificationRequired({
                    doctorName: doctor.name,
                    patientName: patient.name,
                    patientUHID: patient.UHID,
                    appointmentId,
                    creatorRole: actor.designation,
                    creatorName: actor.name
                })
            );
        }

        await recordAudit({
            actor,
            action: "MEDICAL_RECORD_CREATED",
            targetType: "MEDICAL_RECORD",
            targetId: record.medicalRecordId,
            message: MESSAGES.AUDIT.MEDICAL_RECORD_STAFF_CREATED_DRAFT(
                actor.designation,
                actor.name,
                doctor.employeeCode,
                doctor.name
            )
        });
    }

    return sendSuccess(res, STATUS.CREATED, MESSAGES.MEDICAL_RECORD.CREATED, {
        medicalRecord: record
    });
};

// Update a DRAFT medical record. Doctors may also finalize; staff may only keep it DRAFT.
exports.updateMedicalRecord = async (req, res) => {

    const { medicalRecordId } = req.params;
    const {
        symptoms,
        diagnosis,
        prescriptionItems,
        notes,
        status
    } = req.body;

    const actor = await resolveActor(req.user);
    const doctorRole = isDoctorActor(actor);

    const record = await MedicalRecord.findOne({
        medicalRecordId,
        isDeleted: { $ne: true }
    });

    if (!record) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.MEDICAL_RECORD.NOT_FOUND);
    }

    // A doctor can only touch their own records
    if (doctorRole && record.doctorEmployeeId !== req.user.employeeCode) {
        throw new AppError(STATUS.FORBIDDEN, MESSAGES.MEDICAL_RECORD.OWN_ONLY);
    }

    // Finalized records are immutable
    if (record.status === "FINALIZED") {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.MEDICAL_RECORD.ONLY_DRAFT_EDITABLE);
    }

    let willFinalize = false;
    if (status === "FINALIZED") {
        if (!doctorRole) {
            throw new AppError(STATUS.FORBIDDEN, MESSAGES.MEDICAL_RECORD.STAFF_CANNOT_FINALIZE);
        }
        willFinalize = true;
    }

    // Reject no-op updates (a DRAFT -> FINALIZED transition always counts as a change)
    if (
        !willFinalize &&
        !hasFieldChanges(
            record,
            { symptoms, diagnosis, notes, prescriptionItems },
            ["symptoms", "diagnosis", "notes", "prescriptionItems"],
            { arrayKeys: { prescriptionItems: ["name", "dosage", "duration"] } }
        )
    ) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.COMMON.NO_CHANGES);
    }

    // Apply editable fields
    if (symptoms !== undefined) {
        record.symptoms = symptoms;
    }
    if (diagnosis !== undefined) {
        record.diagnosis = diagnosis;
    }
    if (prescriptionItems !== undefined) {
        record.prescriptionItems = prescriptionItems;
    }
    if (notes !== undefined) {
        record.notes = notes;
    }

    const createdByStaff = record.createdByDesignation && record.createdByDesignation !== "DOCTOR";

    if (willFinalize) {
        record.status = "FINALIZED";
        await record.save();

        const appointment = await Appointment.findOne({ appointmentId: record.appointmentId });
        if (appointment) {
            appointment.status = "COMPLETED";
            await appointment.save();
        }

        const patient = await Patient.findOne({ UHID: record.patientId }).select("name email");
        if (patient?.email) {
            await sendAppointmentEmail(
                patient.email,
                emailTemplates.diagnosisReportAvailable({ patientName: patient.name })
            );
        }

        const message = createdByStaff
            ? MESSAGES.AUDIT.MEDICAL_RECORD_VERIFIED_FINALIZED(
                  record.createdByDesignation,
                  record.createdByName,
                  record.doctorName
              )
            : MESSAGES.AUDIT.MEDICAL_RECORD_DOCTOR_UPDATED_FINALIZED(record.doctorName);

        await recordAudit({
            actor,
            action: "MEDICAL_RECORD_FINALIZED",
            targetType: "MEDICAL_RECORD",
            targetId: record.medicalRecordId,
            message
        });
    } else {
        await record.save();

        if (doctorRole) {
            await recordAudit({
                actor,
                action: "MEDICAL_RECORD_UPDATED",
                targetType: "MEDICAL_RECORD",
                targetId: record.medicalRecordId,
                message: MESSAGES.AUDIT.MEDICAL_RECORD_DOCTOR_UPDATED_DRAFT(record.doctorName)
            });
        } else {
            // Staff update — assigned doctor must verify again
            const doctor = await Employee.findOne({
                employeeCode: record.doctorEmployeeId
            }).select("email");

            if (doctor?.email) {
                await sendAppointmentEmail(
                    doctor.email,
                    emailTemplates.medicalRecordVerificationUpdated({
                        doctorName: record.doctorName,
                        patientName: record.patientName,
                        patientUHID: record.patientUHID,
                        appointmentId: record.appointmentId,
                        creatorRole: actor.designation,
                        creatorName: actor.name
                    })
                );
            }

            await recordAudit({
                actor,
                action: "MEDICAL_RECORD_UPDATED",
                targetType: "MEDICAL_RECORD",
                targetId: record.medicalRecordId,
                message: MESSAGES.AUDIT.MEDICAL_RECORD_STAFF_UPDATED_DRAFT(
                    actor.designation,
                    actor.name,
                    record.doctorEmployeeId,
                    record.doctorName
                )
            });
        }
    }

    return sendSuccess(res, STATUS.OK, MESSAGES.MEDICAL_RECORD.UPDATED, {
        medicalRecord: record
    });
};

// Paginated, role-scoped list with partial-match search
exports.listMedicalRecords = async (req, res) => {

    const actor = await resolveActor(req.user);
    const scopedDoctorId = isDoctorActor(actor) ? req.user.employeeCode : null;

    const filter = buildMedicalRecordFilter(req.query, scopedDoctorId);

    return paginateMedicalRecords(filter, req.query, res);
};

// Fetch a single full medical record (doctor own-scoped)
exports.getMedicalRecordById = async (req, res) => {

    const { medicalRecordId } = req.params;

    const actor = await resolveActor(req.user);

    const filter = { medicalRecordId, isDeleted: { $ne: true } };
    if (isDoctorActor(actor)) {
        filter.doctorEmployeeId = req.user.employeeCode;
    }

    const record = await MedicalRecord.findOne(filter).select("-__v").lean();

    if (!record) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.MEDICAL_RECORD.NOT_FOUND);
    }

    return sendSuccess(res, STATUS.OK, MESSAGES.MEDICAL_RECORD.RETRIEVED, {
        medicalRecord: record
    });
};

// Returns the existing (non-deleted) record for an appointment, or null.
// Used by the appointment-detail popup to decide create vs edit.
exports.getMedicalRecordByAppointment = async (req, res) => {

    const { appointmentId } = req.params;

    const actor = await resolveActor(req.user);

    const filter = { appointmentId, isDeleted: { $ne: true } };
    if (isDoctorActor(actor)) {
        filter.doctorEmployeeId = req.user.employeeCode;
    }

    const record = await MedicalRecord.findOne(filter).select("-__v").lean();

    return sendSuccess(res, STATUS.OK, MESSAGES.MEDICAL_RECORD.RETRIEVED, {
        medicalRecord: record || null
    });
};

// Soft delete (Admin/Owner only); record is never physically removed
exports.deleteMedicalRecord = async (req, res) => {

    const { medicalRecordId } = req.params;

    const actor = await resolveActor(req.user);

    const record = await MedicalRecord.findOne({
        medicalRecordId,
        isDeleted: { $ne: true }
    });

    if (!record) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.MEDICAL_RECORD.NOT_FOUND);
    }

    record.isDeleted = true;
    record.deletedAt = new Date();
    record.deletedBy = actor.employeeCode;
    await record.save();

    await recordAudit({
        actor,
        action: "MEDICAL_RECORD_DELETED",
        targetType: "MEDICAL_RECORD",
        targetId: record.medicalRecordId,
        message: MESSAGES.AUDIT.MEDICAL_RECORD_DELETED(
            record.medicalRecordId,
            actor.designation,
            actor.name
        )
    });

    return sendSuccess(res, STATUS.OK, MESSAGES.MEDICAL_RECORD.DELETED, {
        medicalRecord: record
    });
};
