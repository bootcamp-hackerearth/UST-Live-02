import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { styles } from '../../../styles/patient/appointments/bookAppointmentForm.style';

type Props = Readonly<{
    availableSlots: string[];
    selectedSlot: string;
    loading: boolean;
    appointmentDate: string;
    onSelectSlot: (slot: string) => void;
}>;

const isToday = (date: string) => {
    if (!date) {
        return false;
    }

    const today = new Date();
    const selectedDate = new Date(date);

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return today.getTime() === selectedDate.getTime();
};

export default function SlotSelector({
    availableSlots,
    selectedSlot,
    loading,
    appointmentDate,
    onSelectSlot,
}: Props) {
    const getEmptySlotMessage = () => {
        if (!appointmentDate) {
            return 'Select doctor and date to view slots';
        }

        if (isToday(appointmentDate)) {
            return 'No upcoming slots available for today. Please select another date.';
        }

        return 'No available slots for the selected date.';
    };

    const renderSlotButton = (slot: string) => {
        const isSelected = selectedSlot === slot;

        return (
            <TouchableOpacity
                key={slot}
                style={[
                    styles.slotButton,
                    isSelected && styles.activeSlotButton,
                ]}
                onPress={() => onSelectSlot(slot)}
            >
                <Text
                    style={[
                        styles.slotText,
                        isSelected && styles.activeSlotText,
                    ]}
                >
                    {slot}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderSlotsContent = () => {
        if (loading) {
            return (
                <View style={styles.slotLoadingBox}>
                    <ActivityIndicator />
                    <Text style={styles.slotLoadingText}>Loading slots...</Text>
                </View>
            );
        }

        if (availableSlots.length === 0) {
            return (
                <View style={styles.emptySlotBox}>
                    <Text style={styles.emptySlotText}>
                        {getEmptySlotMessage()}
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.slotGrid}>
                {availableSlots.map(renderSlotButton)}
            </View>
        );
    };

    return (
        <>
            <Text style={styles.label}>Available Time Slots</Text>

            {renderSlotsContent()}
        </>
    );
}