import { Validators } from '@angular/forms';

export const appointmentDetailsValidators = {
  diagnosis: [
    Validators.required
  ],

  medicineName: [
    Validators.required
  ],

  dosage: [
    Validators.required
  ],

  duration: [
    Validators.required
  ]
};