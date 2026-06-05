
const mongooge=require('mongoose')
const userSchema=new mongooge.Schema(
    {
     userName:{type:String,require:true,trim:true},
     passwordHash:{type:String,require:true},
     //status:{type:Boolean,default:true},
     roles:{type:String, enum: [ "OWNER","ADMIN","DOCTOR","RECEPTIONIST","CASHIER","NURSE", "LAB_TECH", "PHARMACIST","TECHNICIAN"],required:true},
  
    status: {
      type: String,
      enum: ["Pending", "Active", "Rejected", "InActive"],
      default: "Pending"
    },
     //The Employee id here stores the objectId from that table
     employeeId:{type:String,required:true},
     lastLoginAt: {type: Date,default: null},
     mustResetPassword: {
            type: Boolean,
            default: true
        }
    },
    
    
   {
    timestamps: true, //auto adds createdAt & updatedAt
   }
)

module.exports=mongooge.model("User",userSchema);