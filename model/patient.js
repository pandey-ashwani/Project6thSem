const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const patientSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    age:{
        type:String,
        required:true
    },

    aadhar: {
    type: String,
    required: true,
    unique: true,
    validate: {
        validator: function(v) {
            return /^\d{12}$/.test(v);
        },
        message: "Aadhaar must be exactly 12 digits"
    }
},
    disease:{
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

    hospital:{
        type:String,
        required:true
    },

    doctor:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Doctor",
    },
    role: { 
        type: String, 
        default: 'patient', // Set default role
        required: true 
    },

    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Admin",
    },

    prescriptions: [{
        medicines: [{
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            duration: { type: String, required: true },
            instructions: { type: String }
        }],
        date: { type: Date, default: Date.now },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
    }]

});

patientSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Patient", patientSchema);
