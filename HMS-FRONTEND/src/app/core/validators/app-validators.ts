import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormGroup,
} from '@angular/forms';

export const PHONE_PATTERN = /^(\+\d{1,3} )?\d{10}$/;

export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const NAME_PATTERN = /^\p{L}[\p{L} .'-]*$/u;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

export const MED_REG_PATTERN = /^MED-[0-9-]+$/;

export const TIME_SLOT_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

export const USERNAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9._-]{2,29}$/;
// Must start with letter, 3–30 chars, allows letters/numbers/dots/underscores/hyphens

export const STRICT_EMAIL_PATTERN =
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
// Requires proper TLD (at least 2 chars) — rejects varsg@gggg

export const QUALIFICATION_ITEM_PATTERN =  /^(?=.*[a-zA-Z])[a-zA-Z ,.()\-]{2,}$/;
// Each qualification must contain at least one letter, min 2 chars

export const SPECIALIZATION_PATTERN =
  /^(?=.*[a-zA-Z])[a-zA-Z ,.()\-]{2,100}$/;
// Must contain letters, 2–100 chars, allows spaces/commas/dots/parens/hyphens

export const MAX_CONSULTATION_FEE = 50000;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateOnly(value: unknown): Date | null {
  if (!value) {
    return null;
  }
  let d: Date;
  if (value instanceof Date) {
    d = new Date(value);
  } else if (typeof value === 'string' || typeof value === 'number') {
    d = new Date(value);
  } else {
    return null;
  }
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

export function todayIsoDate(): string {
  const d = startOfToday();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// NEW: Helper to get min/max date strings for joining date input binding
export function joiningDateLimits(): { min: string; max: string } {
  const today = new Date();

  const minDate = new Date(today);
  minDate.setFullYear(minDate.getFullYear() - 1); // 1 year back

  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 6); // 6 months forward

  const fmt = (d: Date) => {
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  return { min: fmt(minDate), max: fmt(maxDate) };
}

export const noFutureDate: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const date = toDateOnly(control.value);
  if (!date) {
    return null;
  }
  return date.getTime() > startOfToday().getTime()
    ? { futureDate: true }
    : null;
};

export const noPastDate: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const date = toDateOnly(control.value);
  if (!date) {
    return null;
  }
  return date.getTime() < startOfToday().getTime() ? { pastDate: true } : null;
};

// NEW: Joining date range validator
// Allows up to 1 year in the past and up to 6 months in the future
export const joiningDateRangeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const date = toDateOnly(control.value);
  if (!date) {
    return null; // required handles empty
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setFullYear(minDate.getFullYear() - 1);

  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + 6);

  if (date < minDate || date > maxDate) {
    return { joiningDateRange: true };
  }
  return null;
};

export const usernameValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) {
    return null; // required handles empty
  }
  return USERNAME_PATTERN.test(value) ? null : { username: true };
};

// NEW: Strict email validator — requires valid TLD
// Rejects varsg@gggg, accepts john@hospital.com
// Error: { strictEmail: true }
export const strictEmailValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) {
    return null; // required handles empty
  }
  return STRICT_EMAIL_PATTERN.test(value) ? null : { strictEmail: true };
};

// Phone must match the country-code + 10-digit pattern. Error: { phone: true }
export const phoneValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) {
    return null;
  }
  return PHONE_PATTERN.test(value) ? null : { phone: true };
};

export const nameValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) {
    return null;
  }
  if (value.length < NAME_MIN_LENGTH || value.length > NAME_MAX_LENGTH) {
    return { name: true };
  }
  return NAME_PATTERN.test(value) ? null : { name: true };
};

export const medicalRegistrationValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) {
    return null;
  }
  return MED_REG_PATTERN.test(value) ? null : { medicalRegistration: true };
};

// NEW: Qualification content validator
// Each comma-separated item must contain at least one letter, min 2 chars
// Rejects pure numbers like "123", "999"
// Error: { qualification: '<message string>' }
export const qualificationContentValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const raw = (control.value ?? '').toString().trim();
  if (!raw) {
    return null; // required handles empty
  }

  const items = raw
    .split(',')
    .map((q: string) => q.trim())
    .filter((q: string) => q.length > 0);

  if (items.length === 0) {
    return { qualification: 'At least one qualification is required' };
  }

  const invalidItem = items.find(
    (item: string) => !QUALIFICATION_ITEM_PATTERN.test(item),
  );

  if (invalidItem) {
    return {
      qualification: `"${invalidItem}" is not valid — each qualification must contain letters (e.g. MBBS, MD)`,
    };
  }

  return null;
};

// NEW: Specialization content validator
// Must contain letters, 2–100 chars
// Rejects pure numbers like "123"
// Error: { specialization: true }
export const specializationContentValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) {
    return null; // required handles empty
  }
  return SPECIALIZATION_PATTERN.test(value) ? null : { specialization: true };
};

// NEW: Consultation fee validator with maximum limit
// Must be 0 or above, cannot exceed MAX_CONSULTATION_FEE (₹50,000)
// Errors: { negative: true } | { feeMax: true } | { feeInvalid: true }
export const consultationFeeValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === '' || value === undefined) {
    return null; // required handles empty
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return { feeInvalid: true };
  }
  if (num < 0) {
    return { negative: true };
  }
  if (num > MAX_CONSULTATION_FEE) {
    return { feeMax: true };
  }

  return null;
};

export const passwordValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString();
  if (!value) {
    return null;
  }
  if (value.length < 8 || !PASSWORD_PATTERN.test(value)) {
    return { weakPassword: true };
  }
  return null;
};

export const passwordComplexity: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString();
  if (!value) {
    return null;
  }

  const errors: ValidationErrors = {};
  if (!/[A-Z]/.test(value)) {
    errors['uppercase'] = true;
  }
  if (!/[a-z]/.test(value)) {
    errors['lowercase'] = true;
  }
  if (!/\d/.test(value)) {
    errors['number'] = true;
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    errors['special'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};

export function notSameAs(newKey: string, otherKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fg = group as FormGroup;
    const newVal = fg.get(newKey)?.value;
    const otherVal = fg.get(otherKey)?.value;
    if (newVal && otherVal && newVal === otherVal) {
      return { sameAsCurrent: true };
    }
    return null;
  };
}

export const timeSlotValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) {
    return null;
  }
  return TIME_SLOT_PATTERN.test(value) ? null : { timeSlot: true };
};

function timeToMinutes(value: unknown): number | null {
  if (typeof value !== 'string') {
    return null;
  }
  const m = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) {
    return null;
  }
  return Number(m[1]) * 60 + Number(m[2]);
}

export const slotTimeOrder: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const start = timeToMinutes(group.get('startTime')?.value);
  const end = timeToMinutes(group.get('endTime')?.value);
  if (start === null || end === null) {
    return null;
  }
  return start < end ? null : { slotTimeOrder: true };
};

export const slotsNoConflict: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const slots = (control.value ?? []) as Array<{
    day?: string;
    startTime?: string;
    endTime?: string;
  }>;
  const seen = new Set<string>();
  const byDay: Record<
    string,
    Array<{ start: number; end: number; startTime: string; endTime: string }>
  > = {};

  for (const slot of slots) {
    const day = (slot.day ?? '').toString().toUpperCase();
    const start = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);
    if (!day || start === null || end === null || start >= end) {
      continue;
    }

    const key = `${day}-${slot.startTime}-${slot.endTime}`;
    if (seen.has(key)) {
      return {
        slotConflict: `Duplicate slot: ${day} ${slot.startTime}–${slot.endTime}`,
      };
    }
    seen.add(key);

    for (const e of byDay[day] ?? []) {
      if (start < e.end && end > e.start) {
        return {
          slotConflict: `Overlapping slots on ${day}: ${slot.startTime}–${slot.endTime} overlaps with ${e.startTime}–${e.endTime}`,
        };
      }
    }
    byDay[day] ??= [];
    byDay[day].push({
      start,
      end,
      startTime: slot.startTime!,
      endTime: slot.endTime!,
    });
  }
  return null;
};

export function passwordMatchValidator(
  passwordKey = 'password',
  confirmKey = 'confirmPassword',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const fg = group as FormGroup;
    const password = fg.get(passwordKey)?.value;
    const confirm = fg.get(confirmKey)?.value;
    if (password && confirm && password !== confirm) {
      return { passwordMismatch: true };
    }
    return null;
  };
}

export const notBlank: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (control.value == null) {
    return null;
  }
  return control.value.toString().trim().length === 0
    ? { required: true }
    : null;
};

export const nonNegative: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (
    control.value === null ||
    control.value === '' ||
    control.value === undefined
  ) {
    return null;
  }
  const num = Number(control.value);
  if (Number.isNaN(num)) {
    return { number: true };
  }
  return num < 0 ? { negative: true } : null;
};