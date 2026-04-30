const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Appointment schema - stores doctor assignment with scheduled date
const appointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    doctorName: {
        type: String
    },
    disease: {
        type: String,
        required: true
    },
    appointmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'today', 'completed', 'cancelled'],
        default: 'pending'
    },
    prescriptions: [{
        medicines: [{
            name: String,
            dosage: String,
            duration: String,
            instructions: String
        }],
        date: { type: Date, default: Date.now }
    }],
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

// Consultation schema - stores each doctor assignment with disease (for history)
const consultationSchema = new mongoose.Schema({
    disease: {
        type: String,
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    doctorName: {
        type: String
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    prescriptions: [{
        medicines: [{
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            duration: { type: String, required: true },
            instructions: { type: String }
        }],
        date: { type: Date, default: Date.now },
        notes: { type: String }
    }],
    
});

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

    // Current active doctor (for backward compatibility)
    doctor:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Doctor",
    },
    
    // Appointments array - stores scheduled appointments with dates
    appointments: [appointmentSchema],
    
    // Consultations array - stores history of doctor assignments
    consultations: [consultationSchema],
    
    role: { 
        type: String, 
        default: 'patient',
        required: true 
    },

    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Admin",
    }
});

patientSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Patient", patientSchema);
