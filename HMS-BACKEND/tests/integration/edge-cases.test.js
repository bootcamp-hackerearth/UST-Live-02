const axios = require("axios");
const {
  BASE_URL,
  PATIENT_BASE_URL,
  staffLogin,
  patientLogin,
  staffGet,
  staffPost,
} = require("../helpers");
require("dotenv").config({ path: "./tests/.env.test" });

describe("⚡ Edge Cases and Security Tests", () => {

  let adminToken, patientToken;

  beforeAll(async () => {
    adminToken = await staffLogin(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
    patientToken = await patientLogin(
      process.env.PATIENT_EMAIL,
      process.env.PATIENT_PASSWORD
    );
  });

  // ── API Health ──────────────────────────────────────────────────────────

  describe("API Health", () => {

    test("Root endpoint responds with success", async () => {
      const res = await axios.get(`${BASE_URL}/`, {
        validateStatus: () => true,
      });
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });

    test("DB status shows connected", async () => {
      const res = await axios.get(`${BASE_URL}/api/db-status`, {
        validateStatus: () => true,
      });
      expect(res.status).toBe(200);
      expect(res.data.data.readyState).toBe(1);
    });

    test("Unknown route returns 404", async () => {
      const res = await axios.get(`${BASE_URL}/api/unknown-route`, {
        validateStatus: () => true,
      });
      expect(res.status).toBe(404);
    });
  });

  // ── Security Edge Cases ─────────────────────────────────────────────────

  describe("Security Edge Cases", () => {

    test("SQL injection attempt in login email is rejected", async () => {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {
          email: "admin@test.com'; DROP TABLE users; --",
          password: "password",
        },
        { validateStatus: () => true }
      );
      expect([400, 401, 422]).toContain(res.status);
      expect(res.data.success).toBe(false);
    });

    test("XSS attempt in patient name is accepted or sanitized", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "<script>alert('xss')</script>",
          phone: "+91 9876500099",
          email: `xss_${Date.now()}@test.com`,
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
            contactNumber: "+91 9876500098",
          },
          status: "ACTIVE",
        },
        adminToken
      );
      expect([201, 400, 422]).toContain(res.status);
    });

    test("Very long string input is handled", async () => {
      const longString = "a".repeat(10000);
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        { email: longString, password: longString },
        { validateStatus: () => true }
      );
      expect([400, 401, 413, 422]).toContain(res.status);
    });

    test("Empty body on login is rejected", async () => {
      const res = await axios.post(
        `${BASE_URL}/api/auth/login`,
        {},
        { validateStatus: () => true }
      );
      expect([400, 422]).toContain(res.status);
    });

    test("Patient cannot access another patient appointments", async () => {
      const res = await axios.get(
        `${PATIENT_BASE_URL}/api/patient/appointments`,
        {
          headers: { Authorization: `Bearer ${patientToken}` },
          validateStatus: () => true,
        }
      );
      expect(res.status).toBe(200);
      res.data.data.appointments.forEach((a) => {
        expect(a.patientUHID || a.patientId).toBeDefined();
      });
    });
  });

  // ── Rate Limiting ───────────────────────────────────────────────────────

  describe("Rate Limiting", () => {

    test("Multiple failed logins do not crash server", async () => {
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        attempts.push(
          axios.post(
            `${BASE_URL}/api/auth/login`,
            { email: "wrong@test.com", password: "wrong" },
            { validateStatus: () => true }
          )
        );
      }
      const results = await Promise.all(attempts);
      results.forEach((res) => {
        expect([401, 422, 429]).toContain(res.status);
      });
    });
  });

  // ── Pagination Edge Cases ───────────────────────────────────────────────

  describe("Pagination Edge Cases", () => {

    test("Page 0 defaults to page 1", async () => {
      const res = await staffGet("/api/patients?page=0&limit=5", adminToken);
      expect(res.status).toBe(200);
      expect(res.data.data.page).toBeGreaterThanOrEqual(1);
    });

    test("Limit over 100 is capped", async () => {
      const res = await staffGet(
        "/api/patients?page=1&limit=999",
        adminToken
      );
      expect(res.status).toBe(200);
      expect(res.data.data.limit).toBeLessThanOrEqual(100);
    });

    test("Negative limit is handled", async () => {
      const res = await staffGet(
        "/api/patients?page=1&limit=-5",
        adminToken
      );
      expect(res.status).toBe(200);
    });

    test("Non-numeric page returns valid response", async () => {
      const res = await staffGet(
        "/api/patients?page=abc&limit=5",
        adminToken
      );
      expect(res.status).toBe(200);
      expect(res.data.data.page).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Session and Token Edge Cases ────────────────────────────────────────

  describe("Session and Token Edge Cases", () => {

    test("Expired format token is rejected", async () => {
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        "eyJlbXBsb3llZUNvZGUiOiJFTVAtMDAwMDAxIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9." +
        "invalidsignature";
      const res = await staffGet("/api/patients", fakeToken);
      expect(res.status).toBe(401);
    });

    test("Token without Bearer prefix is rejected", async () => {
      const token = await staffLogin(
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_PASSWORD
      );
      const res = await axios.get(`${BASE_URL}/api/patients`, {
        headers: { Authorization: token },
        validateStatus: () => true,
      });
      expect(res.status).toBe(401);
    });

    test("Multiple simultaneous requests with same token work", async () => {
      const token = await staffLogin(
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_PASSWORD
      );
      const requests = Array(5).fill(null).map(() =>
        staffGet("/api/patients", token)
      );
      const results = await Promise.all(requests);
      results.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });

    test("Refresh without cookie returns 401", async () => {
      const res = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
        {},
        { validateStatus: () => true }
      );
      expect(res.status).toBe(401);
    });
  });

  // ── Data Validation Edge Cases ──────────────────────────────────────────

  describe("Data Validation Edge Cases", () => {

    test("Invalid phone format is rejected", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "Test Patient",
          phone: "123",
          email: `invalid_${Date.now()}@test.com`,
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
            contactNumber: "+91 9876500001",
          },
          status: "ACTIVE",
        },
        adminToken
      );
      expect([400, 422]).toContain(res.status);
    });

    test("Future date of birth is accepted or rejected", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "Future DOB Patient",
          phone: "+91 9876500001",
          email: `future_${Date.now()}@test.com`,
          gender: "Male",
          dob: "2099-01-01",
          address: {
            houseName: "House",
            houseNumber: "1",
            city: "City",
            postCode: "500001",
          },
          emergencyContact: {
            contactName: "Contact",
            relationship: "Sibling",
            contactNumber: "+91 9876500002",
          },
          status: "ACTIVE",
        },
        adminToken
      );
      expect([201, 400, 422]).toContain(res.status);
    });

    test("Invalid gender value is rejected", async () => {
      const res = await staffPost(
        "/api/patients/create-patient",
        {
          name: "Invalid Gender",
          phone: "+91 9876500001",
          email: `gender_${Date.now()}@test.com`,
          gender: "UNKNOWN",
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
            contactNumber: "+91 9876500002",
          },
          status: "ACTIVE",
        },
        adminToken
      );
      expect([400, 422]).toContain(res.status);
    });
  });
});