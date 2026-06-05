const express = require('express');
const morgan = require('morgan');
const connectDB = require('../src/config/dbConfig');
const seedData = require('./utils/seedData');
const seedAdmin = require('./utils/seedAdmin');
const userRoute = require('./routes/user.route');
const authRoute = require('./routes/auth.route');
const doctorUser = require('./routes/doctor.route');
const errorHandler = require('./middlewares/errorHandler.middleware');
const jwtAuth = require('./middlewares/jwtAuth.middleware');
const cors = require('cors');

const app = express();

connectDB();
seedData();
seedAdmin();
app.set('x-powered-by', false);
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
    origin: ['https://localhoast:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions))
// health route
app.get('/', (req, res) => {
    res.send('HMS backend is running');
});
app.use('/api/auth', authRoute);
// Protect everything below with JWT auth
app.use(jwtAuth);
app.use('/api/users', userRoute);
app.use('/api/doctors', doctorUser);

app.use(errorHandler);
module.exports = app;