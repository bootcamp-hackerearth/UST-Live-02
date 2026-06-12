export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
};

export type AppointmentStackParamList = {
    ViewAppointments: undefined;
    BookAppointment: undefined;
    EditAppointment: {
        appointmentData: {
            appointmentCode: string;
            doctorEmployeeID: string;
            date: string;
            timeSlot: string;
        }
    };
};