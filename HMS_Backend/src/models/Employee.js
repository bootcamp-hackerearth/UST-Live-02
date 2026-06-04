const mongoose = require("mongoose"); 
const Counter = require("./Counter")
 
const employeeSchema = new mongoose.Schema({
    employeeId: { type: String, unique: true,trim:true,uppercase:true },
    name: { type: String, required: true },
    phone: { type: String,  },
    email: { type: String, required: true,unique:true,lowercase:true},
    department:{
        type:String,
        enum: ['OPD','IPD','LAB','PHARMACY','ADMIN'],
        
    },
    designation:{
        type:String,
        enum: ['OWNER','DOCTOR','NURSE','RECEPTIONIST','CASHIER',
            'LAB_TECH','PHARMACIST','ADMIN'],
            
    },
    
    joiningDate: { type: Date },
    medicalRegistrationNumber: { type: String},
    specialisation: {type:String},
    qualification: [
        { type: String,  }
    ],
    consultationFee: { type: Number, default: 0 },
availabilitySlots: {
    type: [
      {
        day: {
          type: String,
          enum: [
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
          ],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    default: undefined,
  },
 
});
         
 
employeeSchema.pre('save', async function () {
    if (this.isNew) {
        
            const counter = await Counter.findOneAndUpdate(
                { name: 'Employee' },
                { $inc: { seq: 1 } }, // Creates sequence
                { new: true, upsert: true } // upsert is update and insert
            );
            this.employeeId = `EMP-${String(counter.seq).padStart(6, '0')}`; // create 6 digit sequence number
         
    }
   
});
module.exports = mongoose.model('Employee', employeeSchema);
 