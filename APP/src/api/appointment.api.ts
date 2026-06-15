import client from "./client";

export const getAppointmentsApi = () =>
  client.get("/appointments");

export const getMyAppointmentsApi = () =>
  client.get("/appointments/my");

export const bookAppointmentApi = (data: any) =>
  client.post("/appointments", data);

export const updateAppointmentApi = (id: string, data: any) =>
  client.put(`/appointments/${id}`, data);

export const deleteAppointmentApi = (id: string) =>
  client.delete(`/appointments/${id}`);

export const getDoctorsApi = () =>
  client.get("/employees/doctors").catch((error) => {
    if (error?.response?.status === 404) {
      return client.get("/appointments/doctors");
    }

    throw error;
  });

export const getAvailableSlotsApi = (doctorId: string, appointmentDate: string) =>
  client.get("/appointments/available-slots", {
    params: { doctorId, appointmentDate },
  });
