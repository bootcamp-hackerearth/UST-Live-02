

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {   
        email: {type: String,required: true,unique: true,lowercase: true,trim: true,},
        passwordHash: {type:String},
        status: {type:String,enum:['ACTIVE','PENDING','INACTIVE','REJECTED']},
        role : {type:String,enum:['OWNER','ADMIN','DOCTOR','RECEPTIONIST','CASHIER','NURSE' ,'LAB_TECH ','PHARMACIST']},
        employeeId: {type:String},
        createdAt: {type:Date,default:null},
        lastLoginAt:{type:Date,default:null},
        is_verified:               { type: Boolean, default: false },
        verification_token:        { type: String, default: null },
        verification_token_expiry: { type: Date, default: null },
    }
)

module.exports = mongoose.model('User',userSchema);