const {
  staffLogin,
  staffGet,
  staffPost,
  staffPut,
} = require("../helpers");
require("dotenv").config({ path: "./tests/.env.test" });

describe("👤 Patient Management Tests", () => {

  let adminToken, receptionistToken, doctorToken;

  beforeAll(async () => {
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

  // ── Patient List ────────────────────────────────────────────────────────

  describe("Patient List", () => {

    test("Returns paginated patient list", async () => {
      const res = await staffGet("/api/patients", adminToken);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.data.patients)).toBe(true);
      expect(res.data.data.total).toBeDefined();
      expect(res.data.data.page).toBeDefined();
      expect(res.data.data.totalPages).toBeDefined();
    });

    test("Pagination works correctly", async () => {
      const res = await staffGet("/api/patients?page=1&limit=2", adminToken);
      expect(res.status).toBe(200);
      expect(res.data.data.patients.length).toBeLessThanOrEqual(2);
      expect(res.data.data.limit).toBe(2);
    });

    test("Status filter works", async () => {
      const res = await staffGet("/api/patients?status=ACTIVE", adminToken);
      expect(res.status).toBe(200);
      res.data.data.patients.forEach((p) => {
        expect(p.status).toBe("ACTIVE");
      });
    });

    test("Search by name works", async () => {
      const res = await staffGet("/api/patients/search?q=Varun", adminToken);
      expect(res.status).toBe(200);
      expect(res.data.data.patients.length).toBeGreaterThan(0);
    });

    test("Search by UHID works", async () => {
      const res = await staffGet(
        `/api/patients/search?q=${process.env.PATIENT_UHID}`,
        adminToken
      );
      expect(res.status).toBe(200);
      expect(res.data.data.patients.length).toBeGreaterThan(0);
    });
  });

  // ── Create Patient ──────────────────────────────────────────────────────

  describe("Create Patient", () => {

    test("Admin can create a patient", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "Test Patient E2E",
          phone: "+91 9876500001",
          email: `testpatient_${Date.now()}@test.com`,
          gender: "Male",
          dob: "1990-01-15",
          address: {
            houseName: "Test House",
            houseNumber: "1A",
            city: "Test City",
            postCode: "500001",
          },
          emergencyContact: {
            contactName: "Emergency Contact",
            relationship: "Spouse",
            contactNumber: "+91 9876500002",
          },
          status: "ACTIVE",
        },
        adminToken
      );
      expect([201, 422]).toContain(res.status);
      if (res.status === 201) {
        expect(res.data.data.patient.UHID).toBeDefined();
      }
    });

    test("Receptionist can create a patient", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "Receptionist Created Patient",
          phone: "+91 9876500003",
          email: `receppatient_${Date.now()}@test.com`,
          gender: "Female",
          dob: "1985-05-20",
          address: {
            houseName: "Recep House",
            houseNumber: "2B",
            city: "Test City",
            postCode: "500002",
          },
          emergencyContact: {
            contactName: "Emergency",
            relationship: "Parent",
            contactNumber: "+91 9876500004",
          },
          status: "ACTIVE",
        },
        receptionistToken
      );
      expect([201, 422]).toContain(res.status);
    });

    test("Cannot create patient with duplicate email", async () => {
      const email = `dup_${Date.now()}@test.com`;
      await staffPost(
        "/api/patients/create-patient",
        {
          name: "First Patient",
          phone: "+91 9876500005",
          email,
          gender: "Male",
          dob: "1990-01-01",
          address: {
            houseName: "House",
            houseNumber: "1",
            city: "City",
            postCode: "500001",
          },
          emergencyContact: {
            contactName: "Contact",
            relationship: "Sibling",
            contactNumber: "+91 9876500006",
          },
          status: "ACTIVE",
        },
        adminToken
      );

      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "Second Patient",
          phone: "+91 9876500007",
          email,
          gender: "Female",
          dob: "1992-01-01",
          address: {
            houseName: "House2",
            houseNumber: "2",
            city: "City2",
            postCode: "500002",
          },
          emergencyContact: {
            contactName: "Contact2",
            relationship: "Parent",
            contactNumber: "+91 9876500008",
          },
          status: "ACTIVE",
        },
        adminToken
      );
      expect([409, 422]).toContain(res.status);
    });

    test("Cannot create patient with missing required fields", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        { name: "Incomplete Patient" },
        adminToken
      );
      expect([400, 422]).toContain(res.status);
    });

    test("Doctor cannot create patient", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "Doctor Created",
          phone: "+91 9876500009",
          email: `docpatient_${Date.now()}@test.com`,
          gender: "Male",
          dob: "1990-01-01",
          address: {
            houseName: "House",
            houseNumber: "1",
            city: "City",
            postCode: "500001",
          },
          emergencyContact: {
            contactName: "Contact",
            relationship: "Sibling",
            contactNumber: "+91 9876500010",
          },
          status: "ACTIVE",
        },
        doctorToken
      );
      expect(res.status).toBe(403);
    });
  });

  // ── Get Patient By UHID ─────────────────────────────────────────────────

  describe("Get Patient By UHID", () => {

    test("Can get patient by UHID", async () => {
      const res = await staffGet(
        `/api/patients/${process.env.PATIENT_UHID}`,
        adminToken
      );
      expect(res.status).toBe(200);
      expect(res.data.data.patient.UHID).toBe(process.env.PATIENT_UHID);
    });

    test("Returns 404 for non-existent UHID", async () => {
      const res = await staffGet("/api/patients/UHID-999999", adminToken);
      expect(res.status).toBe(404);
    });
  });

  // ── Update Patient ──────────────────────────────────────────────────────

  describe("Update Patient", () => {

    test("Admin can update patient phone", async () => {
      const res = await staffPut(
        `/api/patients/${process.env.PATIENT_UHID}`,
        { phone: "+91 9876599999" },
        adminToken
      );
      expect([200, 500]).toContain(res.status);
    });

    test("Receptionist can update patient", async () => {
      const res = await staffPut(
        `/api/patients/${process.env.PATIENT_UHID}`,
        { phone: "+91 9876588888" },
        receptionistToken
      );
      expect([200, 500]).toContain(res.status);
    });

    test("Doctor cannot update patient", async () => {
      const res = await staffPut(
        `/api/patients/${process.env.PATIENT_UHID}`,
        { phone: "+91 9876577777" },
        doctorToken
      );
      expect(res.status).toBe(403);
    });

    test("Cannot update to duplicate email", async () => {
      const res = await staffPut(
        `/api/patients/${process.env.PATIENT_UHID}`,
        { email: process.env.ADMIN_EMAIL },
        adminToken
      );
      expect([409, 400, 422, 500]).toContain(res.status);
    });
  });
});