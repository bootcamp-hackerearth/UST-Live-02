import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

import { getAvailableTimeSlots, getDoctors } from "../services/user.service";
import { UserModel } from "../types/user.types";
import { NavigationModel } from "../types/navigation.types";
import { AppointmentModel } from "../types/appointment.types";

export interface AppointmentFormErrors {
  date: string;
  doctorEmployeeId: string;
  timeSlot: string;
}

export interface UseAppointmentFormOptions {
  initialAppointment?: AppointmentModel;
}

export function useAppointmentForm({ initialAppointment }: UseAppointmentFormOptions = {}) {
  const navigator = useNavigation<NativeStackNavigationProp<NavigationModel>>();

  const [doctors, setDoctors] = useState<UserModel[]>([]);
  const [isShow, setIsShow] = useState(false);
  const [isDateSet, setIsDateSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(initialAppointment?.doctorEmployeeId ?? "");
  const [date, setDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState(initialAppointment?.timeSlot ?? "");
  const [errors, setErrors] = useState<AppointmentFormErrors>({
    date: "",
    doctorEmployeeId: "",
    timeSlot: "",
  });

  useEffect(() => {
    const init = async () => {
      await fetchDoctors();
      const id = await AsyncStorage.getItem("patientId");
      setPatientId(id ?? "");

      if (initialAppointment) {
        setTimeSlot(initialAppointment.timeSlot);
        setDate(new Date(initialAppointment.date));
        setIsDateSet(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (initialAppointment && doctors.length > 0) {
      setDoctorId(initialAppointment.doctorEmployeeId);
    }
  }, [doctors]);

  useEffect(() => {
    if (doctorId && isDateSet) {
      fetchAvailableTimeSlots();
    }
  }, [doctorId, date, isDateSet]);


  const fetchDoctors = async () => {
    try {
      const result = await getDoctors();
      setDoctors(result);
      return result;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableTimeSlots = async () => {
    try {
      const data = await getAvailableTimeSlots(doctorId, date);

      if (initialAppointment) {
        const isSameDoctor = initialAppointment.doctorEmployeeId === doctorId;
        const isSameDate =
          new Date(initialAppointment.date).toDateString() === date.toDateString();

        if (isSameDoctor && isSameDate) {
          const merged = data.includes(initialAppointment.timeSlot)
            ? data
            : [...data, initialAppointment.timeSlot];
          setAvailableSlots(merged);
          setTimeSlot(initialAppointment.timeSlot);
          return;
        }
      }

      setAvailableSlots(data);
      setTimeSlot("");
    } catch (err) {
      console.error(err);
    }
  };

  const validateDate = (d: Date): string => {
    const input = new Date(d);
    const today = new Date();
    input.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return input <= today ? "Appointments cannot be booked for today or past dates." : "";
  };

  const validateDoctorEmployeeId = (id: string): string =>
    id ? "" : "Please select a doctor";

  const validateTimeSlot = (slot: string): string =>
    slot ? "" : "Time slot is required";

  const validateAppointment = (): boolean => {
    const newErrors: AppointmentFormErrors = {
      doctorEmployeeId: validateDoctorEmployeeId(doctorId),
      date: validateDate(date),
      timeSlot: validateTimeSlot(timeSlot),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };


  const maxDateLimit = (): Date => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d;
  };

  const onDateChange = (newDate: Date) => {
    const errorMessage = validateDate(newDate);
    setIsShow(false);
    if (errorMessage === "") {
      setDate(newDate);
      setIsDateSet(true);
      setErrors((prev) => ({ ...prev, date: "" }));
    } else {
      setErrors((prev) => ({ ...prev, date: errorMessage }));
    }
  };

  const setDoctor = (employeeId: string) => {
    setAvailableSlots([]);
    setDoctorId(employeeId);
    setTimeSlot("");
  };

  const clearFields = () => {
    setTimeSlot("");
    setErrors({ date: "", doctorEmployeeId: "", timeSlot: "" });
    setAvailableSlots([]);
    setIsDateSet(false);
    setDoctorId("");
    setDate(new Date());
  };

  const showValidationError = () =>
    Toast.show({
      type: "error",
      text1: "Validation Failed",
      text2: "Please check the input fields",
    });

  const goToAppointments = () => navigator.navigate("viewAppointment");

  return {
    doctors,
    isShow,
    setIsShow,
    isDateSet,
    isLoading,
    setIsLoading,
    patientId,
    doctorId,
    date,
    availableSlots,
    timeSlot,
    setTimeSlot,
    errors,
    
    onDateChange,
    setDoctor,
    clearFields,
    validateAppointment,
    showValidationError,
    maxDateLimit,
    goToAppointments,
  };
}
