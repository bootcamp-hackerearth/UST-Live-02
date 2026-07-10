export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSlotMinutes = (slot: string) => {
  const [hours, minutes] = slot.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
};

export const isPastSlotForDate = (slot: string, appointmentDate: string) => {
  if (!appointmentDate || appointmentDate !== formatLocalDate(new Date())) {
    return false;
  }

  const slotMinutes = getSlotMinutes(slot);

  if (slotMinutes === null) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slotMinutes <= currentMinutes;
};

export const filterFutureSlotsForDate = (
  slots: string[],
  appointmentDate: string,
) => slots.filter((slot) => !isPastSlotForDate(slot, appointmentDate));
