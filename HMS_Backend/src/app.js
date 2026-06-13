const express = require("express");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const authRoutes = require("./routes/auth.routes");

const employeeRoutes = require("./routes/employee.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const consultationRoutes = require("./routes/consultation.routes");
const patientRoutes = require("./routes/patient.routes");

const cors = require("cors");
const app = express();
app.disable('x-powered-by');
app.use(cors({origin: ["http://localhost:4200"],credentials: true}));
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

app.use(
  "/api/patients",

  patientRoutes,
);

app.use(
  "/api/consultations",

  consultationRoutes,
);

app.use((error, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

module.exports = app;
