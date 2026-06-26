import { useState, useEffect, useRef } from "react";
import { FlatList } from "react-native";
import { appointmentService } from "../services/appointmentService";

export function useAppointmentData(isEditMode: boolean, appointmentData: any, preselectedDoctorId?: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const doctorListRef = useRef<FlatList>(null);
    const slotListRef = useRef<FlatList>(null);

    const [doctors, setDoctors] = useState<any[]>([]);
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(tomorrow);
    const [selectedSlot, setSelectedSlot] = useState("");

    useEffect(() => {
        fetchDoctors();
        if (isEditMode && appointmentData) {
            setSelectedDoctor(appointmentData.doctorEmployeeID);
            setSelectedDate(new Date(appointmentData.date));
            setSelectedSlot(appointmentData.timeSlot);
        } else if (!isEditMode && preselectedDoctorId) {
            setSelectedDoctor(preselectedDoctorId);
        }
    }, [isEditMode, appointmentData, preselectedDoctorId]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) fetchAvailableSlots();
        else setSlots([]);
    }, [selectedDoctor, selectedDate]);

    useEffect(() => {
        if (doctors.length > 0 && selectedDoctor) {
            const index = doctors.findIndex((d) => d.employeeCode === selectedDoctor);
            if (index !== -1) {
                setTimeout(() => doctorListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 }), 300);
            }
        }
    }, [doctors, selectedDoctor]);

    useEffect(() => {
        if (slots.length > 0 && selectedSlot) {
            const index = slots.indexOf(selectedSlot);
            if (index !== -1) {
                setTimeout(() => slotListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 }), 300);
            }
        }
    }, [slots, selectedSlot]);

    const fetchDoctors = async () => {
        try {
            const data = await appointmentService.getDoctors();
            setDoctors(data);
        } catch (err) {
            console.error("Failed to load doctor dataset:", err);
        }
    };

    const fetchAvailableSlots = async () => {
        try {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            const data = await appointmentService.getAvailableSlots(selectedDoctor, formattedDate);
            if (isEditMode && selectedSlot === appointmentData?.timeSlot) {
                if (!data.includes(appointmentData.timeSlot)) data.unshift(appointmentData.timeSlot);
            }
            setSlots(data);
        } catch (err) {
            console.error("Failed to compile slots:", err);
        }
    };

    return {
        doctors, slots, selectedDoctor, setSelectedDoctor, selectedDate, setSelectedDate, selectedSlot, setSelectedSlot, tomorrow, doctorListRef, slotListRef
    };
}