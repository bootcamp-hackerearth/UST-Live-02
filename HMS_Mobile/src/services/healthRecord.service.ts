import api from "./api.service";

export const getMyHealthRecord = (
  timelineCursor = "",
  labCursor = "",
  documentCursor = "",
  limit?: number,
) => {
  return api.get("/health-records/me", {
    params: {
      pagination: "cursor",
      timelineCursor,
      labCursor,
      documentCursor,
      ...(limit ? { limit } : {}),
    },
  });
};
