export const getApiErrorMessage = (
  error: any,
  fallback = 'Something went wrong'
): string => {
  const firstValidationError = error?.error?.errors?.[0];

  if (firstValidationError?.path && firstValidationError?.msg) {
    return `${firstValidationError.path}: ${firstValidationError.msg}`;
  }

  if (firstValidationError?.param && firstValidationError?.msg) {
    return `${firstValidationError.param}: ${firstValidationError.msg}`;
  }

  if (firstValidationError?.msg) {
    return firstValidationError.msg;
  }

  return error?.error?.message || fallback;
};
