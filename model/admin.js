const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose")

const adminSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email : {
        type:String,
        required : true
    },

    phone:{
        type:Number,
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

    hospital:{
        type:String,
        required:true
    },

    role: { 
        type: String, 
        default: 'admin', // Set default role
        required: true 
    }
});

adminSchema.plugin(passportLocalMongoose)
module.exports=mongoose.model("Admin",adminSchema);