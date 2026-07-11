import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

export const futureAppointmentDateValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value = control.value as string | null;

  if (!value) {
    return null;
  }

  const selectedDate = new Date(value);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return {
      pastDate: true
    };
  }

  return null;
};

export const appointmentValidators = {
  patientId: [
    Validators.required
  ],

  doctorId: [
    Validators.required
  ],

  appointmentDate: [
    Validators.required,
    futureAppointmentDateValidator
  ],

  timeSlot: [
    Validators.required
  ],

  reason: [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(500)
  ]
};