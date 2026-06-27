export const formatDate = (value?: string) => {
  return value?.split("T")[0] || "Not available";
};

export const formatDocumentType = (value?: string) => {
  if (!value) {
    return "Document";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const formatInfoValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not available";
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, fieldValue]) =>
        fieldValue !== null && fieldValue !== undefined && fieldValue !== "",
    );

    if (!entries.length) {
      return "Not available";
    }

    return entries
      .map(([key, fieldValue]) => `${formatLabel(key)}: ${String(fieldValue)}`)
      .join("\n");
  }

  return String(value);
};

const formatLabel = (value: string) => {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
};
