const mongoose = require('mongoose');
const Counter = require('./counter');
const employeeSchema = new mongoose.Schema({

    employeeCode:{type : String, trim: true, unique : true},
    name :{type : String, required: true},
    email : {type : String, required: true, unique: true},
    phone : {type : String, required : true, unique : true},
    department : {type : String, enum : ["OPD", "IPD", "ICU", "Pharmacy", "Administration", "Front Office"]},
    designation : {type : String},
    status :{type : String, enum :["Active", "Inactive", "Pending"], default : "Inactive"},
    joiningDate : {type : Date, required : true},
    medicalRegistrationNo : {type : String},
    specialization : {type : String},
    qualification : [{ type: String }],
    consultationFee : {type : Number},
    availabilitySlots : [{type : String}]

});

employeeSchema.pre('save', async function () {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'Employee' },
                { $inc: { seq: 1 } }, 
                { new: true, upsert: true } 
            );
            this.employeeCode = `EMP-${String(counter.seq).padStart(6, '0')}`;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
});
module.exports = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);