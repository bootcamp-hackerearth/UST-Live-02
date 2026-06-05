require('dotenv').config();
const express=require('express');
const cors=require('cors');
const morgan=require('morgan');
const userRoutes=require('./src/routes/user.route')
const authRoutes=require('./src/routes/auth.route')
const doctorRoutes = require('./src/routes/doctor.route');

const app=new express();

const seedData=require('./src/utils/seedData')
const seedAdmin=require('./src/utils/seedAdmin')
seedData();
seedAdmin();



app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

app.use('/api/users',userRoutes);

app.use('/api/auth',authRoutes);

app.use('/api/doctors', doctorRoutes);


module.exports=app;