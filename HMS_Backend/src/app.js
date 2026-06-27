const express = require("express");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
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
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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

app.use("/api/auth", authRoutes);

app.use("/api/employees", employeeRoutes);
app.use(
  "/api/dashboard",

  dashboardRoutes,
);
app.use(
  "/api/appointments",

  appointmentRoutes,
);
app.use("/api/locations", locationRoutes);
app.use(
  "/api/patients",

  patientRoutes,
);

app.use(
  "/api/consultations",

  consultationRoutes,
);
app.use("/api/health-records", healthRecordRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/nodes", nodeRoutes);

app.use(errorMiddleware);

module.exports = app;
