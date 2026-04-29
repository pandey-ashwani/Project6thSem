const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const superAdminSchema = new mongoose.Schema({
    name : {
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true
    },

    phone:{
        type:Number,
        required:true
    },

    role:{
        type:String,
        default:'superAdmin',
        required:true
    }
});

superAdminSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("SuperAdmin",superAdminSchema);