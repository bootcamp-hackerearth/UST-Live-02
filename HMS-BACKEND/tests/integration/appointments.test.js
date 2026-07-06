const {
  staffLogin,
  staffGet,
  staffPost,
  staffPut,
  patientLogin,
  patientPost,
  patientGet,
} = require("../helpers");
require("dotenv").config({ path: "./tests/.env.test" });

describe("📅 Appointment Tests", () => {

  let ownerToken, adminToken, receptionistToken, doctorToken, patientToken;
  let createdAppointmentId;
  let doctorEmployeeId;

  beforeAll(async () => {
    ownerToken = await staffLogin(
      process.env.OWNER_EMAIL,
      process.env.OWNER_PASSWORD
    );
    adminToken = await staffLogin(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
    receptionistToken = await staffLogin(
      process.env.RECEPTIONIST_EMAIL,
      process.env.RECEPTIONIST_PASSWORD
    );
    doctorToken = await staffLogin(
      process.env.DOCTOR_EMAIL,
      process.env.DOCTOR_PASSWORD
    );
    patientToken = await patientLogin(
      process.env.PATIENT_EMAIL,
      process.env.PATIENT_PASSWORD
    );

    // Get doctor employee code
    const meRes = await staffGet("/api/auth/me", doctorToken);
    doctorEmployeeId = meRes.data.data.user.employeeCode;
  });

  // ── List Appointments ───────────────────────────────────────────────────

  describe("List Appointments", () => {

    test("Admin gets paginated appointments", async () => {
      const res = await staffGet("/api/appointments", adminToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data.appointments)).toBe(true);
      expect(res.data.data.total).toBeDefined();
      expect(res.data.data.totalPages).toBeDefined();
    });

    test("Appointments include enriched patient and doctor data", async () => {
      const res = await staffGet("/api/appointments?limit=1", adminToken);

      expect(res.status).toBe(200);
      const appt = res.data.data.appointments[0];
      expect(appt.patient).toBeDefined();
      expect(appt.doctor).toBeDefined();
      expect(appt.patient.name).toBeDefined();
      expect(appt.doctor.name).toBeDefined();
    });

    test("Status filter works", async () => {
      const res = await staffGet(
        "/api/appointments?status=BOOKED",
        adminToken
      );

      expect(res.status).toBe(200);
      res.data.data.appointments.forEach((a) => {
        expect(a.status).toBe("BOOKED");
      });
    });

    test("Doctor gets only own appointments", async () => {
      const res = await staffGet("/api/appointments/my", doctorToken);

      expect(res.status).toBe(200);
      res.data.data.appointments.forEach((a) => {
        expect(a.doctorEmployeeId).toBe(doctorEmployeeId);
      });
    });
  });

  // ── Create Appointment ──────────────────────────────────────────────────

  describe("Create Appointment (Staff)", () => {

    test("Receptionist can create appointment", async () => {
      // Get future date
      const future = new Date();
      future.setDate(future.getDate() + 7);
      const dateStr = future.toISOString().split("T")[0];

      const res = await staffPost(
        "/api/appointments/create-appointment",
        {
          patientId: process.env.PATIENT_UHID,
          doctorEmployeeId,
          appointmentDate: dateStr,
          timeSlot: "10:00-10:30",
        },
        receptionistToken
      );

      if (res.status === 201) {
        createdAppointmentId = res.data.data.appointment.appointmentId;
      }

      expect([201, 409]).toContain(res.status);
    });

    test("Doctor cannot create staff appointment", async () => {
      const future = new Date();
      future.setDate(future.getDate() + 8);
      const dateStr = future.toISOString().split("T")[0];

      const res = await staffPost(
        "/api/appointments/create-appointment",
        {
          patientId: process.env.PATIENT_UHID,
          doctorEmployeeId,
          appointmentDate: dateStr,
          timeSlot: "11:00-11:30",
        },
        doctorToken
      );

      expect(res.status).toBe(403);
    });

    test("Cannot create appointment in the past", async () => {
      const res = await staffPost(
        "/api/appointments/create-appointment",
        {
          patientId: process.env.PATIENT_UHID,
          doctorEmployeeId,
          appointmentDate: "2020-01-01",
          timeSlot: "10:00-10:30",
        },
        receptionistToken
      );

      expect(res.status).toBe(409);
    });

    test("Cannot create appointment more than 6 months ahead", async () => {
      const farFuture = new Date();
      farFuture.setMonth(farFuture.getMonth() + 8);
      const dateStr = farFuture.toISOString().split("T")[0];

      const res = await staffPost(
        "/api/appointments/create-appointment",
        {
          patientId: process.env.PATIENT_UHID,
          doctorEmployeeId,
          appointmentDate: dateStr,
          timeSlot: "10:00-10:30",
        },
        receptionistToken
      );

      expect(res.status).toBe(409);
    });

    test("Cannot create appointment with invalid time slot format", async () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const dateStr = future.toISOString().split("T")[0];

      const res = await staffPost(
        "/api/appointments/create-appointment",
        {
          patientId: process.env.PATIENT_UHID,
          doctorEmployeeId,
          appointmentDate: dateStr,
          timeSlot: "invalid-slot",
        },
        receptionistToken
      );

      expect(res.status).toBe(400);
    });
  });

  // ── Patient Books Appointment ───────────────────────────────────────────

  describe("Patient Appointment Flow", () => {

    test("Patient can book appointment (creates as PENDING)", async () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const dateStr = future.toISOString().split("T")[0];

      const res = await patientPost(
        "/api/patient/appointments",
        {
          doctorEmployeeId,
          appointmentDate: dateStr,
          timeSlot: "14:00-14:30",
        },
        patientToken
      );

      expect([201, 409]).toContain(res.status);
      if (res.status === 201) {
        expect(res.data.data.appointment.status).toBe("PENDING");
      }
    });

    test("Patient can view own appointments", async () => {
      const res = await patientGet(
        "/api/patient/appointments",
        patientToken
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data.appointments)).toBe(true);
    });

    test("Patient cannot book in past", async () => {
      const res = await patientPost(
        "/api/patient/appointments",
        {
          doctorEmployeeId,
          appointmentDate: "2020-01-01",
          timeSlot: "10:00-10:30",
        },
        patientToken
      );

      expect(res.status).toBe(409);
    });
  });

  // ── Booked Slots ────────────────────────────────────────────────────────

  describe("Booked Slots", () => {

    test("Returns booked slots for doctor and date", async () => {
      const future = new Date();
      future.setDate(future.getDate() + 7);
      const dateStr = future.toISOString().split("T")[0];

      const res = await staffGet(
        `/api/appointments/booked-slots?doctorEmployeeId=${doctorEmployeeId}&date=${dateStr}`,
        receptionistToken
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data.bookedSlots)).toBe(true);
    });

    test("Booked slots requires doctorEmployeeId", async () => {
      const res = await staffGet(
        "/api/appointments/booked-slots?date=2026-08-01",
        receptionistToken
      );

      expect(res.status).toBe(400);
    });
  });
});
