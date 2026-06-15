export const LETTERS_ONLY_REGEX = /^[A-Za-z\s]+$/;
export const NUMBERS_ONLY_REGEX = /^\d+$/;
export const PHONE_REGEX = /^\d{10}$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_24_HOUR_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const onlyLetters = (value: string) =>
  value.replaceAll(/[^A-Za-z\s]/g, "");

export const onlyNumbers = (value: string) =>
  value.replaceAll(/\D/g, "");

export const onlyTimeCharacters = (value: string) =>
  value.replaceAll(/[^\d:]/g, "").slice(0, 5);

export const isFutureDate = (value: string) => {
  const selectedDate = new Date(value);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return selectedDate > today;
};

export const validatePassword = (password: string) =>
  PASSWORD_REGEX.test(password);

export const isPastOrCurrentTimeToday = (date: Date, timeSlot: string) => {
  const today = new Date();
  const selectedDate = new Date(date);

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate.getTime() !== today.getTime()) {
    return false;
  }

  const [hours, minutes] = timeSlot.split(":").map(Number);
  const slotMinutes = hours * 60 + minutes;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slotMinutes <= currentMinutes;
};
