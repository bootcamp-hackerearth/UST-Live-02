const generateSlots = (
  startTime,
  endTime,
  slotDuration,
  breakStartTime,
  breakEndTime,
) => {
  const slots = [];

  // Convert HH:mm format to total minutes
  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(":");

    return Number.parseInt(hours) * 60 + Number.parseInt(minutes);
  };

  // Convert total minutes back to HH:mm format
  const convertToTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  let currentTime = convertToMinutes(startTime);

  const end = convertToMinutes(endTime);
  const breakStart = breakStartTime ? convertToMinutes(breakStartTime) : null;

  const breakEnd = breakEndTime ? convertToMinutes(breakEndTime) : null;

  // Generate slots until end time
  while (currentTime < end) {
    // Skip break period
    if (
      breakStart !== null &&
      breakEnd !== null &&
      currentTime >= breakStart &&
      currentTime < breakEnd
    ) {
      currentTime = breakEnd;
      continue;
    }

    slots.push(convertToTime(currentTime));

    currentTime += slotDuration;
  }

  return slots;
};

module.exports = generateSlots;
