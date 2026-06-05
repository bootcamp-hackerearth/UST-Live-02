const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const connectDB = require("../src/config/dbConfig");
const seedData = require("./utils/seedData");
const seedAdmin = require("./utils/seedAdmin");

const userRoute = require("./routes/user.route");
const authRoute = require("./routes/auth.route");
const doctorUser = require("./routes/doctor.route");

const errorHandler = require("./middlewares/errorHandler.middleware");
const jwtAuth = require("./middlewares/jwtAuth.middleware");

const app = express();

app.set("x-powered-by", false);
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: ["http://localhost:4200"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use("/api/auth", authRoute);

app.use(jwtAuth);

app.use("/api/users", userRoute);
app.use("/api/doctors", doctorUser);

app.get("/", (req, res) => {
  res.send("HMS backend is running");
});

app.use(errorHandler);

const initializeApplication = async () => {
  try {
    await connectDB();

    console.log("Database connected");

    await seedData();
    await seedAdmin();

    console.log("Application initialization completed");
  } catch (error) {
    console.error("Application initialization failed:", error.message);
    process.exit(1);
  }
};

initializeApplication();

module.exports = app;
