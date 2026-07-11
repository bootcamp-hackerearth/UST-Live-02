import { useState } from 'react';
import {  Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { styles } from '../../../styles/patient/appointments/bookAppointmentForm.style';

type Props = Readonly<{
    appointmentDate: string;
    selectedDateObject: Date;
    minimumDate: Date;
    maximumDate: Date;
    onDateChange: (event: any, date?: Date) => void;
}>;

export default function DateSelector({
    appointmentDate,
    selectedDateObject,
    minimumDate,
    maximumDate,
    onDateChange,
}: Props) {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        onDateChange(event, date);
    };

    return (
        <>
            <Text style={styles.label}>Appointment Date</Text>

            <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={{ color: appointmentDate ? '#2C2C2A' : '#888780' }}>
                    {appointmentDate || 'Select appointment date'}
                </Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDateObject}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onValueChange={handleChange}   
                    onDismiss={() => setShowDatePicker(false)}
                />
            )}

            <Text style={styles.helperText}>Date format: YYYY-MM-DD</Text>
        </>
    );
}