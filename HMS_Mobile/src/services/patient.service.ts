import axios
from "axios";

import {
  API_BASE_URL
}
from "../constants/api";

import {
  getToken
}
from "../storage/token.storage";

export const getDashboard =
async () => {

  const token =
    await getToken();
console.log(
  "DASHBOARD TOKEN",
  await getToken()
);
  return axios.get(

    `${API_BASE_URL}/patients/dashboard`,

    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};

export const registerPatient = (
  data: any
) => {

  return axios.post(
    `${API_BASE_URL}/patients/register`,
    data
  );
};
export const getProfile = async () => {
  const token = await getToken();

  return axios.get(
    `${API_BASE_URL}/patients/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const updateProfile = async (
  data: any
) => {
  const token = await getToken();

  return axios.put(
    `${API_BASE_URL}/patients/profile`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
