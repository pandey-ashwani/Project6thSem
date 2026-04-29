const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")

const doctorSchema = new mongoose.Schema({
    name : {
        type:String,
        required : true
    },

    email : {
        type:String,
        required : true
    },

    phone:{
        type:Number,
        required:true
    },

    specialization:{
        type:String,
        required:true
    },

    experience:{
        type:Number,
        required:true
    },

    qualification:{
        type:String,
        required:true
    },

    hospital:{
        type:String,
        required:true
    },

    district:{
        type:String,
        required:true
    },

    state:{
        type:String,
        required:true
    },


    role: { 
        type: String, 
        default: 'doctor', // Set default role
        required: true 
    },

    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Admin",
    }
});

doctorSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("Doctor",doctorSchema);