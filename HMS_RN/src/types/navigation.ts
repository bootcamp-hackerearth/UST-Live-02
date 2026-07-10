/**
 * @file navigation.ts
 * @overview Defines TypeScript types for React Navigation.
 * @description This file contains type definitions for the navigation stacks and their parameters,
 * ensuring type safety for navigation actions and route props throughout the app.
 */

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