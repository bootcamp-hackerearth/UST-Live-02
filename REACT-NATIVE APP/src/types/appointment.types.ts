export type AppointmentModel = {
    appointmentId: string,
    patientId: string,
    doctorEmployeeId: string,
    date: Date,
    status: string,
    timeSlot: string,
    createdByEmployeeId: string,
}