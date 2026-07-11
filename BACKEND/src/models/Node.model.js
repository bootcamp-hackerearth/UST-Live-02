const mongoose=require('mongoose')

const nodeSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    path:{
        type:String,
        required:true,
        unique:true,
        trim:true
        //admin/dashboard like that kind of path 
    },

    icon:{
        type:String,
        required:true
    },
    role:{
        type:[String],
        required:true
    },
    order:{
        type:Number,
        default:0
    },

     isActive: {
        type: Boolean,
        default: true   //lets Admin toggle visibility instead of hard-deleting
    }
},{
    timestamps:true
})

module.exports=mongoose.model('Node',nodeSchema);