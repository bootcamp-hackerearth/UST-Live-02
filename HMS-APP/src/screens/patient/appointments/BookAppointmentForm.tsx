import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

import {  useBookAppointmentForm } from '../../../hooks/useBookAppointmentForm';
import DoctorSelector from './DoctorSelector';
import DateSelector from './DateSelector';
import SlotSelector from './SlotSelector';
import { styles } from '../../../styles/patient/appointments/bookAppointmentForm.style';

type Props =Readonly< {
    routeDoctorId?: string;
    routeDoctorName?: string;
      routeKey?: string;
    onAppointmentCreated: () => void;
}>;

export default function BookAppointmentForm({
    routeDoctorId = '',
    routeDoctorName = '',
     routeKey = '',
    onAppointmentCreated,
}: Props) {
    const {
        doctors, selectedDoctorId, selectedDoctorName, selectedDoctor,
        appointmentDate, selectedDateObject, timeSlot, reason,
        availableSlots, loadingDoctors, slotsLoading, submitting,
        minimumDate, maximumDate,
        setReason, setTimeSlot,
        getDoctorId, getDoctorName,
        handleSelectDoctor, handleDateChange, handleSubmit,
    } = useBookAppointmentForm(routeDoctorId, routeDoctorName, routeKey,onAppointmentCreated);

    if (loadingDoctors) {
        return (
            <View style={styles.card}>
                <ActivityIndicator />
                <Text style={styles.loadingText}>Loading doctors...</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Book Appointment</Text>

            <DoctorSelector
                doctors={doctors}
                selectedDoctorId={selectedDoctorId}
                selectedDoctorName={selectedDoctorName}
                selectedDoctor={selectedDoctor}
                getDoctorId={getDoctorId}
                getDoctorName={getDoctorName}
                onSelectDoctor={handleSelectDoctor}
            />

            <DateSelector
                appointmentDate={appointmentDate}
                selectedDateObject={selectedDateObject}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onDateChange={handleDateChange}
            />

            <SlotSelector
                availableSlots={availableSlots}
                selectedSlot={timeSlot}
                loading={slotsLoading}
                appointmentDate={appointmentDate}
                onSelectSlot={setTimeSlot}
            />

            <Text style={styles.label}>Reason</Text>
            <TextInput
                style={[styles.input, styles.reasonInput]}
                placeholder="Enter reason for visit"
                placeholderTextColor="#888780"
                value={reason}
                onChangeText={setReason}
                multiline
            />

            <TouchableOpacity
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={submitting}
            >
                <Text style={styles.submitButtonText}>
                    {submitting ? 'Booking...' : 'Confirm Appointment'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}