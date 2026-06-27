const express = require("express");
const path = require("node:path");
const authRoutes = require("./routes/auth.routes");

const employeeRoutes = require("./routes/employee.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const consultationRoutes = require("./routes/consultation.routes");
const patientRoutes = require("./routes/patient.routes");
const menuNodeRoutes = require("./routes/menu-node.routes");
const medicalRecordRoutes = require("./routes/medical-record.routes");
const apiPermissionRoutes = require("./routes/api-permission.routes");
const locationRoutes = require("./routes/location.routes");

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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

app.use("/api/menu-nodes", menuNodeRoutes);

app.use("/api/api-permissions", apiPermissionRoutes);

app.use("/api/medical-records", medicalRecordRoutes);

app.use("/api/locations", locationRoutes);
const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);
module.exports = app;
