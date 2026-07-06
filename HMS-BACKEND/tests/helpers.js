const axios = require("axios");
require("dotenv").config({ path: "./tests/.env.test" });

const BASE_URL = process.env.BASE_URL || "http://13.60.138.236";
const PATIENT_BASE_URL = process.env.PATIENT_BASE_URL || "http://13.60.138.236";

// Staff login helper with retry on 429
async function staffLogin(email, password, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    }, { validateStatus: () => true });

    if (res.status === 200) return res.data.data.accessToken;
    if (res.status === 429) {
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.data)}`);
  }
  throw new Error('Login failed after retries - rate limited');
}

// Patient login helper with retry
async function patientLogin(email, password, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await axios.post(
      `${PATIENT_BASE_URL}/api/patient/auth/login`,
      { email, password },
      { validateStatus: () => true, withCredentials: true }
    );

    if (res.status === 200) return res.data.data.accessToken;
    if (res.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
    throw new Error(`Patient login failed: ${res.status}`);
  }
  throw new Error('Patient login failed after retries');
}

// Authenticated axios GET for staff
async function staffGet(path, token) {
  return axios.get(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
}

// Authenticated axios POST for staff
async function staffPost(path, data, token) {
  return axios.post(`${BASE_URL}${path}`, data, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
}

// Authenticated axios PUT for staff
async function staffPut(path, data, token) {
  return axios.put(`${BASE_URL}${path}`, data, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
}

// Authenticated axios DELETE for staff
async function staffDelete(path, token) {
  return axios.delete(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
}

// Authenticated axios for patient
async function patientGet(path, token) {
  return axios.get(`${PATIENT_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
}

async function patientPost(path, data, token) {
  return axios.post(`${PATIENT_BASE_URL}${path}`, data, {
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true,
  });
}

module.exports = {
  BASE_URL,
  PATIENT_BASE_URL,
  staffLogin,
  patientLogin,
  staffGet,
  staffPost,
  staffPut,
  staffDelete,
  patientGet,
  patientPost,
};
