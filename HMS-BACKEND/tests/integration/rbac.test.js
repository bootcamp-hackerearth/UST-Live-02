const { staffLogin, staffGet, staffPost } = require("../helpers");
require("dotenv").config({ path: "./tests/.env.test" });

describe("🔒 RBAC (Role-Based Access Control) Tests", () => {

  let ownerToken, adminToken, receptionistToken, doctorToken;

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
  });

  // ── Employee Routes ─────────────────────────────────────────────────────

  describe("Employee Routes", () => {

    test("Owner can access employees list", async () => {
      const res = await staffGet("/api/admin/employees", ownerToken);
      expect(res.status).toBe(200);
    });

    test("Admin can access employees list", async () => {
      const res = await staffGet("/api/admin/employees", adminToken);
      expect(res.status).toBe(200);
    });

    test("Receptionist cannot access employees list", async () => {
      const res = await staffGet("/api/admin/employees", receptionistToken);
      expect(res.status).toBe(403);
    });

    test("Doctor cannot access employees list", async () => {
      const res = await staffGet("/api/admin/employees", doctorToken);
      expect(res.status).toBe(403);
    });
  });

  // ── Patient Routes ──────────────────────────────────────────────────────

  describe("Patient Routes", () => {

    test("Owner can access patients list", async () => {
      const res = await staffGet("/api/patients", ownerToken);
      expect(res.status).toBe(200);
    });

    test("Admin can access patients list", async () => {
      const res = await staffGet("/api/patients", adminToken);
      expect(res.status).toBe(200);
    });

    test("Receptionist can access patients list", async () => {
      const res = await staffGet("/api/patients", receptionistToken);
      expect(res.status).toBe(200);
    });

    test("Doctor cannot access patients list", async () => {
      const res = await staffGet("/api/patients", doctorToken);
      expect(res.status).toBe(403);
    });
  });

  // ── Appointment Routes ──────────────────────────────────────────────────

  describe("Appointment Routes", () => {

    test("Owner can access appointments", async () => {
      const res = await staffGet("/api/appointments", ownerToken);
      expect(res.status).toBe(200);
    });

    test("Admin can access appointments", async () => {
      const res = await staffGet("/api/appointments", adminToken);
      expect(res.status).toBe(200);
    });

    test("Receptionist can access appointments", async () => {
      const res = await staffGet("/api/appointments", receptionistToken);
      expect(res.status).toBe(200);
    });

    test("Doctor can access own appointments", async () => {
      const res = await staffGet("/api/appointments/my", doctorToken);
      expect(res.status).toBe(200);
    });

    test("Doctor cannot access all appointments", async () => {
      const res = await staffGet("/api/appointments", doctorToken);
      expect(res.status).toBe(403);
    });
  });

  // ── Medical Record Routes ───────────────────────────────────────────────

  describe("Medical Record Routes", () => {

    test("Doctor can access medical records", async () => {
      const res = await staffGet("/api/medical-records", doctorToken);
      expect(res.status).toBe(200);
    });

    test("Receptionist can access medical records", async () => {
      const res = await staffGet("/api/medical-records", receptionistToken);
      expect(res.status).toBe(200);
    });

    test("Admin can access medical records", async () => {
      const res = await staffGet("/api/medical-records", adminToken);
      expect(res.status).toBe(200);
    });
  });

  // ── Admin-only Routes ───────────────────────────────────────────────────

  describe("Admin Only Routes", () => {

    test("Owner can access audit logs", async () => {
      const res = await staffGet("/api/admin/audit-logs", ownerToken);
      expect(res.status).toBe(200);
    });

    test("Admin can access audit logs", async () => {
      const res = await staffGet("/api/admin/audit-logs", adminToken);
      expect(res.status).toBe(200);
    });

    test("Receptionist cannot access audit logs", async () => {
      const res = await staffGet("/api/admin/audit-logs", receptionistToken);
      expect(res.status).toBe(403);
    });

    test("Doctor cannot access audit logs", async () => {
      const res = await staffGet("/api/admin/audit-logs", doctorToken);
      expect(res.status).toBe(403);
    });
  });

  // ── Approval Routes ─────────────────────────────────────────────────────

  describe("Approval Routes", () => {

    test("Owner can access pending employees", async () => {
      const res = await staffGet("/api/admin/pending-employees", ownerToken);
      expect(res.status).toBe(200);
    });

    test("Admin can access pending employees", async () => {
      const res = await staffGet("/api/admin/pending-employees", adminToken);
      expect(res.status).toBe(200);
    });

    test("Receptionist cannot access pending employees", async () => {
      const res = await staffGet(
        "/api/admin/pending-employees",
        receptionistToken
      );
      expect(res.status).toBe(403);
    });

    test("Doctor cannot access pending employees", async () => {
      const res = await staffGet(
        "/api/admin/pending-employees",
        doctorToken
      );
      expect(res.status).toBe(403);
    });
  });
});
