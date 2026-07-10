const express = require("express");
const authRoutes = require("./routes/auth.routes");
const path = require("node:path");
const upload = require("../src/middleware/upload.middleware");
const employeeRoutes = require("./routes/employee.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const consultationRoutes = require("./routes/consultation.routes");
const patientRoutes = require("./routes/patient.routes");
const errorMiddleware = require("./middleware/error.middleware");
const nodeRoutes = require("./routes/node.routes");
const healthRecordRoutes = require("./routes/health-record.routes");
const locationRoutes = require("../src/routes/loaction.routes");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const openApiDocument = require("../docs/openapi.json");
const createRateLimitMiddleware = require("./middleware/rate-limit.middleware");
const requestContextMiddleware = require("./middleware/request-context.middleware");
const logger = require("./utils/logger");
const app = express();
app.disable("x-powered-by");

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(requestContextMiddleware);
app.use(
  cors({
    origin: allowedOrigins.length
      ? (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error("Not allowed by CORS"));
        }
      : true,
    credentials: true,
  }),
);
app.use(
  createRateLimitMiddleware({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300,
  }),
);

const shouldLogHttpRequests =
  process.env.ENABLE_HTTP_LOGS !== "false" && process.env.NODE_ENV !== "test";

if (shouldLogHttpRequests) {
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms", {
      skip: (_req, res) => res.statusCode === 304,
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    }),
  );
}

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}

app.use("/api/auth", authRoutes);

app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/patients", patientRoutes);

app.use("/api/consultations", consultationRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/nodes", nodeRoutes);

app.use(errorMiddleware);

module.exports = app;
