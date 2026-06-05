const express = require("express");
const errorHandler = require("./middlewares/errorhandler.middleware");
const morgan = require("morgan");
const app = express();
const seedData = require("./utils/seedData");
const seedAdmin = require("./utils/seedAdmin");
const userRoute = require("./routes/user.routes");
const authRoute = require("./routes/auth.routes");
const connectDB = require("./config/dbConfig");
const seedRoles = require("./utils/seedData");
const jwtAuth = require("./middlewares/jwtAuth.middleware");
const doctorUser = require("./routes/doctor.routes");

connectDB();
seedRoles();
seedAdmin();
app.use(express.json());
//discuss
app.use(morgan("dev"));
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoute);
app.use(jwtAuth);
app.use("/api/users", userRoute);
app.use("/api/doctors", doctorUser);

app.use(errorHandler);
module.exports = app;
