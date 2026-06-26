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

export const getMinimumEmployeeJoiningDate = (): string => {
  return formatDateForInput(
    getShiftedDate(-2)
  );
};

export const getMaximumEmployeeJoiningDate = (): string => {
  return formatDateForInput(
    getShiftedDate(2)
  );
};

export const employeeJoiningDateRangeValidator: ValidatorFn = (
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

export const employeeValidators = {
  firstName: [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(
      /^(?!\s+$)[A-Za-z\s]+$/
    )
  ],

  lastName: [
    Validators.required,
    Validators.minLength(1),
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
    Validators.minLength(8),
    Validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/
    )
  ],

  phone: [
    Validators.required,
    Validators.pattern(
      /^[6-9]\d{9}$/
    )
  ],

  role: [
    Validators.required
  ],

  department: [
    Validators.required
  ],

  designation: [
    Validators.required
  ],

  joiningDate: [
    Validators.required,
    employeeJoiningDateRangeValidator
  ]
};