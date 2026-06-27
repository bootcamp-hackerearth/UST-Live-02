import api from "./api.service";

export const getMyHealthRecord = (
  timelinePage = 1,
  labPage = 1,
  documentPage = 1,
) => {
  return api.get("/health-records/me", {
    params: {
      timelinePage,
      labPage,
      documentPage,
    },
  });
};
