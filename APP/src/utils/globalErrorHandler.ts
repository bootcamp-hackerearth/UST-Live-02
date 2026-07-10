import { logger } from "./logger";

declare const ErrorUtils:
  | {
      getGlobalHandler?: () => (error: Error, isFatal?: boolean) => void;
      setGlobalHandler?: (
        handler: (error: Error, isFatal?: boolean) => void,
      ) => void;
    }
  | undefined;

let initialized = false;

export const initializeGlobalErrorHandler = () => {
  if (initialized || ErrorUtils === undefined) {
    return;
  }

  initialized = true;

  const previousHandler = ErrorUtils.getGlobalHandler?.();

  ErrorUtils.setGlobalHandler?.((error, isFatal) => {
    logger.error("Unhandled React Native error", error, {
      isFatal: Boolean(isFatal),
    });

    previousHandler?.(error, isFatal);
  });
};
