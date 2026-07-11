import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

const getShiftedDate = (monthOffset: number): Date => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + monthOffset);

  return date;
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getMinimumJoiningDate = (): string => {
  return formatDateForInput(
    getShiftedDate(-2)
  );
};

export const getMaximumJoiningDate = (): string => {
  return formatDateForInput(
    getShiftedDate(2)
  );
};

export const joiningDateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value as string | null;

  if (!value) {
    return null;
  }

  const [year, month, day] = value
    .split('-')
    .map(Number);

  const selectedDate = new Date(
    year,
    month - 1,
    day
  );

  selectedDate.setHours(0, 0, 0, 0);

  const minimumDate = getShiftedDate(-2);
  const maximumDate = getShiftedDate(2);

  if (
    selectedDate < minimumDate ||
    selectedDate > maximumDate
  ) {
    return {
      dateOutOfRange: true
    };
  }

  return null;
};

const parseTimeToMinutes = (
  timeValue: string
): number | null => {
  const [time, period] = timeValue.split(' ');

  if (!time || !period) {
    return null;
  }

  let [hours, minutes] = time
    .split(':')
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  if (
    period === 'PM' &&
    hours !== 12
  ) {
    hours += 12;
  }

  if (
    period === 'AM' &&
    hours === 12
  ) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

export const availabilityTimeValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const startTime = group.get(
    'availabilityStartTime'
  )?.value as string | null;

  const endTime = group.get(
    'availabilityEndTime'
  )?.value as string | null;

  if (!startTime || !endTime) {
    return null;
  }

  const startMinutes =
    parseTimeToMinutes(startTime);

  const endMinutes =
    parseTimeToMinutes(endTime);

  if (
    startMinutes === null ||
    endMinutes === null
  ) {
    return null;
  }

  if (endMinutes <= startMinutes) {
    return {
      invalidAvailability: true
    };
  }

  if (endMinutes - startMinutes < 60) {
    return {
      minAvailability: true
    };
  }

  return null;
};

export const doctorValidators = {
  firstName: [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(
      /^(?!\s+$)[A-Za-z\s]+$/
    )
  ],

  lastName: [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(
      /^(?!\s+$)[A-Za-z\s]+$/
    )
  ],

  email: [
    Validators.required,
    Validators.pattern(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    )
  ],

  password: [
    Validators.required,
    Validators.minLength(6)
  ],

  phone: [
    Validators.required,
    Validators.pattern(
      /^[6-9]\d{9}$/
    )
  ],

  department: [
    Validators.required
  ],

  designation: [
    Validators.required
  ],

  joiningDate: [
    Validators.required,
    joiningDateRangeValidator
  ],

  specialization: [
    Validators.required
  ],

  qualification: [
    Validators.required
  ],

  consultationFee: [
    Validators.required,
    Validators.min(1)
  ],

  medicalRegistrationNo: [
    Validators.required
  ],

  availabilityStartTime: [
    Validators.required
  ],

  availabilityEndTime: [
    Validators.required
  ],

  experienceYears: [
    Validators.required,
    Validators.min(0),
    Validators.max(60)
  ],

  availabilityTime:
    availabilityTimeValidator
};