// src/utils/appointments/appointmentBooking.utils.ts

import { Alert } from 'react-native';
import { AppointmentDoctor } from '../../types/appointment.types';

export const startOfDay = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

export const formatDateForBackend = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const getDoctorId = (doctor: AppointmentDoctor) => {
    return doctor.employeeId?._id || '';
};

export const getDoctorName = (doctor?: AppointmentDoctor) => {
    if (!doctor) return 'Doctor';

    if (doctor.name) return doctor.name;

    if (doctor.firstName || doctor.lastName) {
        return `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    }

    if (doctor.employeeId?.userId) {
        return `${doctor.employeeId.userId.firstName || ''} ${
            doctor.employeeId.userId.lastName || ''
        }`.trim();
    }

    return 'Doctor';
};

export const getDoctorJoiningDate = (doctor?: AppointmentDoctor) => {
    const joiningDate = doctor?.employeeId?.joiningDate;

    if (!joiningDate) return null;

    return startOfDay(new Date(joiningDate));
};

export const getMinimumAppointmentDate = (doctor?: AppointmentDoctor) => {
    const today = startOfDay(new Date());
    const joiningDate = getDoctorJoiningDate(doctor);

    if (joiningDate && joiningDate > today) {
        return joiningDate;
    }

    return today;
};

export const getMaximumAppointmentDate = (doctor?: AppointmentDoctor) => {
    const minDate = getMinimumAppointmentDate(doctor);
    const maxDate = new Date(minDate);

    maxDate.setMonth(maxDate.getMonth() + 1);

    return maxDate;
};

export const isAppointmentDateInvalid = (
    appointmentDate: string,
    minDate: Date,
    maxDate: Date
) => {
    const selectedDate = startOfDay(new Date(appointmentDate));

    return selectedDate < minDate || selectedDate > maxDate;
};

export const showInvalidAppointmentDateAlert = (minDate: Date, maxDate: Date) => {
    Alert.alert(
        'Invalid Date',
        `Please select a date between ${formatDateForBackend(
            minDate
        )} and ${formatDateForBackend(maxDate)}`
    );
};