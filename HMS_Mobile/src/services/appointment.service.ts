import axios from "axios";

import {
  API_BASE_URL,
} from "../constants/api";

import {
  getToken,
} from "../storage/token.storage";

export const getAppointments =
async () => {

  const token =
    await getToken();

  return axios.get(

    `${API_BASE_URL}/appointments`,

    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};
export const getAppointmentById =
async (
  id: string
) => {

  const token =
    await getToken();

  return axios.get(

    `${API_BASE_URL}/appointments/${id}`,

    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};
export const cancelAppointment =
async (
  id: string
) => {

  const token =
    await getToken();

  return axios.delete(

    `${API_BASE_URL}/appointments/${id}`,

    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};
export const getAvailableSlots =
async (
  doctorId: string,
  appointmentDate: string
) => {

  const token =
    await getToken();

  return axios.get(

    `${API_BASE_URL}/appointments/available-slots`,

    {
      params: {
        doctorId,
        appointmentDate,
      },

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};
export const bookAppointment =
async (
  data: any
) => {

  const token =
    await getToken();

  return axios.post(

    `${API_BASE_URL}/appointments/patient/book`,

    data,

    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};
export const updateMyAppointment =
async (
  id: string,
  data: any
) => {

  const token =
    await getToken();

  return axios.put(

    `${API_BASE_URL}/appointments/my/${id}`,

    data,

    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};