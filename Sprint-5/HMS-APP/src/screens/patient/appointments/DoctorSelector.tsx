import { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

import { AppointmentDoctor } from '../../../types/appointment.types';
import { styles } from '../../../styles/patient/appointments/bookAppointmentForm.style';

type Props = Readonly<{
    doctors: AppointmentDoctor[];
    selectedDoctorId: string;
    selectedDoctorName: string;
    selectedDoctor?: AppointmentDoctor;
    getDoctorId: (doctor: AppointmentDoctor) => string;
    getDoctorName: (doctor?: AppointmentDoctor) => string;
    onSelectDoctor: (doctor: AppointmentDoctor) => void;
}>;

export default function DoctorSelector({
    doctors,
    selectedDoctorId,
    selectedDoctorName,
    selectedDoctor,
    getDoctorId,
    getDoctorName,
    onSelectDoctor,
}: Props) {
    const [doctorSearch, setDoctorSearch] = useState('');
    const [showAll, setShowAll] = useState(false);

    const filteredDoctors = useMemo(() => {
        if (!doctorSearch.trim()) return doctors;
        const q = doctorSearch.toLowerCase();
        return doctors.filter(
            (d) =>
                getDoctorName(d).toLowerCase().includes(q) ||
                (d.specialization || '').toLowerCase().includes(q)
        );
    }, [doctors, doctorSearch]);

    const visibleDoctors = useMemo(() => {
        if (showAll || doctorSearch.trim()) return filteredDoctors;
        return filteredDoctors.slice(0, 5);
    }, [filteredDoctors, showAll, doctorSearch]);

    return (
        <>
            {/* Selected doctor preview */}
            <Text style={styles.label}>Selected Doctor</Text>
            <View style={styles.selectedDoctorBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={styles.selectedDoctorAvatar}>
                        <Text style={styles.selectedDoctorInitials}>
                            {(selectedDoctorName || getDoctorName(selectedDoctor))
                                .split(' ').filter(Boolean).slice(0, 2)
                                .map((w: string) => w[0].toUpperCase()).join('')}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.selectedDoctorName}>
                            {selectedDoctorName || getDoctorName(selectedDoctor)}
                        </Text>
                        {selectedDoctor?.specialization ? (
                            <Text style={styles.selectedDoctorSpecialization}>
                                {selectedDoctor.specialization}
                            </Text>
                        ) : null}
                    </View>
                    <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Selected</Text>
                    </View>
                </View>
            </View>

            {/* Search + grid */}
            <Text style={styles.label}>Choose Doctor</Text>
            <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                placeholder="Search by name or specialization"
                placeholderTextColor="#888780"
                value={doctorSearch}
                onChangeText={setDoctorSearch}
            />

            <View style={styles.doctorGrid}>
                {visibleDoctors.map((doctor) => {
                    const doctorId = getDoctorId(doctor);
                    const isSelected =
                        selectedDoctorId === doctorId ||
                        selectedDoctorId === doctor.doctorId ||
                        selectedDoctorId === doctor._id;
                    return (
                        <TouchableOpacity
                            key={doctorId}
                            style={[styles.doctorGridCard, isSelected && styles.activeDoctorGridCard]}
                            onPress={() => onSelectDoctor(doctor)}
                        >
                            <Text
                                style={[styles.doctorChipText, isSelected && styles.activeDoctorChipText]}
                                numberOfLines={1}
                            >
                                {getDoctorName(doctor)}
                            </Text>
                            <Text
                                style={[styles.doctorChipSubText, isSelected && styles.activeDoctorChipText]}
                                numberOfLines={1}
                            >
                                {doctor.specialization || 'General'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {!doctorSearch.trim() && filteredDoctors.length > 5 && (
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text style={styles.showMoreText}>
                        {showAll ? 'Show less ↑' : `Show all ${filteredDoctors.length} doctors ↓`}
                    </Text>
                </TouchableOpacity>
            )}
        </>
    );
}