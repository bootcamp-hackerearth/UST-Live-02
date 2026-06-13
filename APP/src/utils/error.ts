type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{
        msg?: string;
      }>;
    };
  };
  message?: string;
};

export const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error !== "object" || error === null) {
    return fallbackMessage;
  }

  const apiError = error as ApiErrorResponse;
  return (
    apiError.response?.data?.errors?.[0]?.msg ||
    apiError.response?.data?.message ||
    apiError.message ||
    fallbackMessage
  );
};
