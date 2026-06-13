import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Appointment } from '../../../types/appointment.types';
import { styles } from '../../../styles/patient/appointments/appointmentCard.style';

type Props = {
  readonly appointment: Appointment;
  readonly onCancel?: (appointmentId: string) => void;
  readonly cancelling?: boolean;
};

export default function AppointmentCard({
  appointment,
  onCancel,
  cancelling = false,
}: Props) {
  const formatDate = (dateValue: string) => {
    if (!dateValue) return '--';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toDateString();
  };

  const getDoctorName = () => {
    const doctor = appointment.doctorId;

    if (!doctor) return 'Doctor';

    if (doctor.name) return doctor.name;

    if (doctor.firstName || doctor.lastName) {
      return `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
    }

    if (doctor.employeeId?.userId) {
      return `${doctor.employeeId.userId.firstName || ''} ${doctor.employeeId.userId.lastName || ''
        }`.trim();
    }

    return 'Doctor';
  };

  const doctorName = getDoctorName();
  const canCancel = appointment.status === 'BOOKED' && Boolean(onCancel);

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentTopRow}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentDoctor}>Dr. {doctorName}</Text>
          <Text style={styles.appointmentMeta}>
            {formatDate(appointment.appointmentDate)} • {appointment.timeSlot}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            appointment.status === 'CANCELLED' && styles.statusCancelled,
            appointment.status === 'COMPLETED' && styles.statusCompleted,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              appointment.status === 'CANCELLED' && styles.statusCancelledText,
              appointment.status === 'COMPLETED' && styles.statusCompletedText,
            ]}
          >
            {appointment.status}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.reasonText} numberOfLines={2}>
          {appointment.reason || 'No reason provided'}
        </Text>

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancel?.(appointment._id)}
            disabled={cancelling}
            activeOpacity={0.8}
          >
            {cancelling ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}