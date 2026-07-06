const axios = require("axios");
const { BASE_URL, PATIENT_BASE_URL, staffLogin, patientLogin } = require("../helpers");
require("dotenv").config({ path: "./tests/.env.test" });

describe("🔐 Authentication Tests", () => {

  // ── Staff Auth ──────────────────────────────────────────────────────────

  describe("Staff Login", () => {

    test("Owner can login successfully", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.OWNER_EMAIL,
        password: process.env.OWNER_PASSWORD,
      }, { validateStatus: () => true });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.data.accessToken).toBeDefined();
      expect(res.data.data.user.roles).toContain("OWNER");
    });

    test("Admin can login successfully", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      }, { validateStatus: () => true });

      expect(res.status).toBe(200);
      expect(res.data.data.user.roles).toContain("ADMIN");
    });

    test("Receptionist can login successfully", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.RECEPTIONIST_EMAIL,
        password: process.env.RECEPTIONIST_PASSWORD,
      }, { validateStatus: () => true });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });

    test("Doctor can login successfully", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.DOCTOR_EMAIL,
        password: process.env.DOCTOR_PASSWORD,
      }, { validateStatus: () => true });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });

    test("Login fails with wrong password", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.OWNER_EMAIL,
        password: "wrongpassword",
      }, { validateStatus: () => true });

      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
    });

    test("Login fails with wrong email", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: "nonexistent@hospital.com",
        password: "anypassword",
      }, { validateStatus: () => true });

      expect(res.status).toBe(401);
      expect(res.data.success).toBe(false);
    });

    test("Login fails with missing email", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        password: "somepassword",
      }, { validateStatus: () => true });

      expect([400, 422]).toContain(res.status);
    });

    test("Login fails with missing password", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.OWNER_EMAIL,
      }, { validateStatus: () => true });

      expect([400, 422]).toContain(res.status);
    });

    test("Login fails with invalid email format", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: "notanemail",
        password: "somepassword",
      }, { validateStatus: () => true });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── JWT Token Tests ─────────────────────────────────────────────────────

  describe("JWT Token Validation", () => {

    test("Request with valid token returns 200", async () => {
      const token = await staffLogin(
        process.env.OWNER_EMAIL,
        process.env.OWNER_PASSWORD
      );

      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });

      expect(res.status).toBe(200);
    });

    test("Request with no token returns 401", async () => {
      const res = await axios.get(`${BASE_URL}/api/patients`, {
        validateStatus: () => true,
      });

      expect(res.status).toBe(401);
    });

    test("Request with invalid token returns 401", async () => {
      const res = await axios.get(`${BASE_URL}/api/patients`, {
        headers: { Authorization: "Bearer invalidtoken123" },
        validateStatus: () => true,
      });

      expect(res.status).toBe(401);
    });

    test("Request with malformed Bearer token returns 401", async () => {
      const res = await axios.get(`${BASE_URL}/api/patients`, {
        headers: { Authorization: "NotBearer token" },
        validateStatus: () => true,
      });

      expect(res.status).toBe(401);
    });

test("Token contains correct user info", async () => {
  const res = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  }, { validateStatus: () => true });

  expect(res.status).toBe(200);
  const user = res.data.data.user;
  expect(user.email).toBe(process.env.ADMIN_EMAIL);
  expect(user.roles).toContain("ADMIN");
  expect(user.mustChangePassword).toBe(false);
});
  });

  // ── Refresh Token Tests ─────────────────────────────────────────────────

  describe("Refresh Token", () => {

    test("Refresh endpoint exists and responds", async () => {
      const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {},
        {
          validateStatus: () => true,
          withCredentials: true,
        }
      );
      // Without a valid refresh cookie should return 401
      expect(res.status).toBe(401);
    });

    test("Logout endpoint works", async () => {
      const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      }, { validateStatus: () => true, withCredentials: true });

      expect(loginRes.status).toBe(200);

      const res = await axios.post(`${BASE_URL}/api/auth/logout`, {},
        {
          headers: {
            Authorization: `Bearer ${loginRes.data.data.accessToken}`,
          },
          validateStatus: () => true,
          withCredentials: true,
        }
      );

      expect(res.status).toBe(200);
    });
  });

  // ── Patient Auth ────────────────────────────────────────────────────────

  describe("Patient Authentication", () => {

    test("Patient can login successfully", async () => {
      const res = await axios.post(
        `${PATIENT_BASE_URL}/api/patient/auth/login`,
        {
          email: process.env.PATIENT_EMAIL,
          password: process.env.PATIENT_PASSWORD,
        },
        { validateStatus: () => true }
      );

      expect(res.status).toBe(200);
      expect(res.data.data.accessToken).toBeDefined();
      expect(res.data.data.patient).toBeDefined();
    });

    test("Patient login fails with wrong password", async () => {
      const res = await axios.post(
        `${PATIENT_BASE_URL}/api/patient/auth/login`,
        {
          email: process.env.PATIENT_EMAIL,
          password: "wrongpassword",
        },
        { validateStatus: () => true }
      );

      expect(res.status).toBe(401);
    });

    test("Patient token rejected on staff routes", async () => {
      const token = await patientLogin(
        process.env.PATIENT_EMAIL,
        process.env.PATIENT_PASSWORD
      );

      const res = await axios.get(`${BASE_URL}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });

      expect(res.status).toBe(401);
    });

    test("Staff token rejected on patient routes", async () => {
      const token = await staffLogin(
        process.env.ADMIN_EMAIL,
        process.env.ADMIN_PASSWORD
      );

      const res = await axios.get(
        `${PATIENT_BASE_URL}/api/patient/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        }
      );

      expect(res.status).toBe(401);
    });
  });
});
