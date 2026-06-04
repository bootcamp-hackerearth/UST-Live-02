const helmet=require("helmet");
const express = require("express");
const app = express();
app.use(helmet());
const userRoutes = require('./Routes/userRoutes');
app.use(express.json());
app.use('/employee', userRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'HMS Backend API is running' });
});
module.exports = app;