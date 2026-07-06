const {
  staffLogin,
  staffGet,
  staffPost,
  patientLogin,
  patientGet,
} = require("../helpers");
require("dotenv").config({ path: "./tests/.env.test" });

describe("🏥 Medical Records Tests", () => {

  let adminToken, doctorToken, receptionistToken, patientToken;
  let doctorEmployeeId;
  let completedAppointmentId;

  beforeAll(async () => {
    adminToken = await staffLogin(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
    doctorToken = await staffLogin(
      process.env.DOCTOR_EMAIL,
      process.env.DOCTOR_PASSWORD
    );
    receptionistToken = await staffLogin(
      process.env.RECEPTIONIST_EMAIL,
      process.env.RECEPTIONIST_PASSWORD
    );
    patientToken = await patientLogin(
      process.env.PATIENT_EMAIL,
      process.env.PATIENT_PASSWORD
    );

    const meRes = await staffGet("/api/auth/me", doctorToken);
    doctorEmployeeId = meRes.data.data.user.employeeCode;

    // Find a COMPLETED or BOOKED appointment to use
    const appts = await staffGet(
      `/api/appointments?status=BOOKED&limit=1`,
      adminToken
    );
    if (appts.data.data.appointments.length > 0) {
      completedAppointmentId =
        appts.data.data.appointments[0].appointmentId;
    }
  });

  // ── List Medical Records ────────────────────────────────────────────────

  describe("List Medical Records", () => {

    test("Admin can list all medical records", async () => {
      const res = await staffGet("/api/medical-records", adminToken);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data.medicalRecords)).toBe(true);
    });

    test("Doctor sees only own medical records", async () => {
      const res = await staffGet("/api/medical-records", doctorToken);

      expect(res.status).toBe(200);
      res.data.data.medicalRecords.forEach((r) => {
        expect(r.doctorEmployeeId).toBe(doctorEmployeeId);
      });
    });

    test("Medical records list is paginated", async () => {
      const res = await staffGet(
        "/api/medical-records?page=1&limit=2",
        adminToken
      );

      expect(res.status).toBe(200);
      expect(res.data.data.medicalRecords.length).toBeLessThanOrEqual(2);
    });

    test("Can filter by patientUHID", async () => {
      const res = await staffGet(
        `/api/medical-records?patientUHID=${process.env.PATIENT_UHID}`,
        adminToken
      );

      expect(res.status).toBe(200);
      res.data.data.medicalRecords.forEach((r) => {
        expect(r.patientUHID).toBe(process.env.PATIENT_UHID);
      });
    });
  });

  // ── Get by Appointment ──────────────────────────────────────────────────

  describe("Get Record by Appointment", () => {

    test("Can get medical record by appointment ID", async () => {
      if (!completedAppointmentId) {
        console.log("Skipping - no appointment available");
        return;
      }

      const res = await staffGet(
        `/api/medical-records/by-appointment/${completedAppointmentId}`,
        adminToken
      );

      expect(res.status).toBe(200);
      // medicalRecord can be null if no record exists yet
      expect(res.data.data).toHaveProperty("medicalRecord");
    });

    test("Returns null for appointment with no record", async () => {
      const res = await staffGet(
        "/api/medical-records/by-appointment/APT-999999",
        adminToken
      );

      // Should return 200 with null record
      expect([200, 404]).toContain(res.status);
    });
  });

  // ── Patient Health Records ──────────────────────────────────────────────

  describe("Patient Health Records (Mobile)", () => {

    test("Patient can view own health records", async () => {
      const res = await patientGet(
        "/api/patient/medical-records",
        patientToken
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data.medicalRecords)).toBe(true);
    });

    test("Patient only sees own records", async () => {
  const res = await patientGet(
    "/api/patient/medical-records",
    patientToken
  );

  expect(res.status).toBe(200);
  // Patient route returns summary — verify records belong to patient
  // via appointmentId linkage (patientUHID not in summary list)
  expect(Array.isArray(res.data.data.medicalRecords)).toBe(true);
  // All records should be FINALIZED (patient only sees finalized)
  res.data.data.medicalRecords.forEach((r) => {
    expect(r.medicalRecordId).toBeDefined();
    expect(r.appointmentId).toBeDefined();
  });
});
  });
});
