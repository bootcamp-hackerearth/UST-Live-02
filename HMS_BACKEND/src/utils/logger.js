const fs = require("node:fs");
const path = require("node:path");
const winston = require("winston");

const isProduction = process.env.NODE_ENV === "production";
const logsDir = path.join(process.cwd(), "logs");

const shouldWriteFileLogs = isProduction || process.env.ENABLE_FILE_LOGS === "true";

if (shouldWriteFileLogs && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const sensitiveKeys = [
  "authorization",
  "cookie",
  "password",
  "accessToken",
  "refreshToken",
  "token",
  "otp",
  "brevo_api_key",
];

const redactValue = (key, value, seen) => {
  if (
    sensitiveKeys.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase()),
    )
  ) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, seen));
  }

  if (value && typeof value === "object") {
    return redact(value, seen);
  }

  return value;
};

const redact = (payload, seen = new WeakSet()) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (seen.has(payload)) {
    return "[Circular]";
  }

  seen.add(payload);

  return Object.entries(payload).reduce((safePayload, [key, value]) => {
    safePayload[key] = redactValue(key, value, seen);
    return safePayload;
  }, {});
};

const redactLogInfo = winston.format((info) => {
  const seen = new WeakSet();
  seen.add(info);
  Object.entries(info).forEach(([key, value]) => {
    info[key] = redactValue(key, value, seen);
  });
  return info;
});

const loggerFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  redactLogInfo(),
  isProduction ? winston.format.json() : winston.format.simple(),
);

const transports = [new winston.transports.Console()];

if (shouldWriteFileLogs) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  format: loggerFormat,
  defaultMeta: {
    service: "hms-backend",
    environment: process.env.NODE_ENV || "development",
  },
  transports,
});

module.exports = logger;
