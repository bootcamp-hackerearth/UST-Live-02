require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const userRoutes = require("./src/routes/user.route");
const authRoutes = require("./src/routes/auth.route");
const nodeRoutes = require("./src/routes/node.route");
const dashboardRoutes = require("./src/routes/dashboard.route");
const doctorRoutes = require("./src/routes/doctor.route");
const patientRoutes = require("./src/routes/patient.route");
const appointmentRoutes = require("./src/routes/appointment.route");
const joinUsRoutes = require("./src/routes/joinUs.route");
const healthRecordRoutes = require("./src/routes/healthRecord.route");
const errorMiddleware = require("./src/middleware/error.middleware");

const app = new express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/node", nodeRoutes);

app.use("/api/join-us", joinUsRoutes);

app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/health-records", healthRecordRoutes);

app.use(errorMiddleware);

module.exports = app;
