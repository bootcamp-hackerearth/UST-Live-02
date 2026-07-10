type LogContext = Record<string, unknown>;

const isDevelopment = __DEV__;

const write = (
  level: "debug" | "info" | "warn" | "error",
  message: string,
  context?: LogContext,
) => {
  if (!isDevelopment && (level === "debug" || level === "info")) {
    return;
  }

  const payload = context ? [message, context] : [message];

  if (level === "error") {
    console.error(...payload);
    return;
  }

  if (level === "warn") {
    console.warn(...payload);
    return;
  }

  if (level === "info") {
    console.info(...payload);
    return;
  }

  console.debug(...payload);
};

export const logger = {
  debug: (message: string, context?: LogContext) =>
    write("debug", message, context),
  info: (message: string, context?: LogContext) =>
    write("info", message, context),
  warn: (message: string, context?: LogContext) =>
    write("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) => {
    const errorContext = context ? { ...context, error } : { error };

    write("error", message, errorContext);
  },
};
