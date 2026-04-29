require("dotenv").config();


const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const ExpressError = require("./expressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const flash = require("connect-flash");
const app = express();
const Patient = require("./model/patient.js");
const Doctor = require("./model/doctor.js");
const Admin = require("./model/admin.js");
const SuperAdmin = require("./model/superAdmin.js");
const Policy = require("./model/policy.js");

const { fail } = require("assert");
const { isatty } = require("tty");
const {isAdminLoggedIn , isDoctorLoggedIn , isSuperAdminLoggedIn ,isPatientLoggedIn, verifyAdminDoctors , verifyAdminPatients , verifyDoctorPatients} = require("./middleware.js");
const patient = require("./model/patient.js");


const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sih-project";


app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"/views"));


const store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sih-project",
    crypto: {
        secret: "mysupersecret"
    },
    touchAfter: 24 * 3600
});


store.on("error", (err) => {
    console.log("Mongo Session Store Error", err);
});

const sessionOption = {
    store,
    secret: "mysupersecret",
    resave: false,
    saveUninitialized : true,
    cookie:{
        expires : new Date(Date.now() + 7*24*60*60*1000),
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use("admin-local",new LocalStrategy(Admin.authenticate()));
passport.use("doctor-local",new LocalStrategy(Doctor.authenticate()));
passport.use("superAdmin-local",new LocalStrategy(SuperAdmin.authenticate()));
passport.use("patient-local",new LocalStrategy(Patient.authenticate()));


passport.serializeUser((user, done) => {
    done(null, { id: user._id, role: user.role });
});

passport.deserializeUser(async (obj, done) => {
    if (obj.role === 'admin') {
        const admin = await Admin.findById(obj.id);
        return done(null, admin);
    } else if (obj.role === 'doctor') {
        const doctor = await Doctor.findById(obj.id);
        return done(null, doctor);
    }else if(obj.role === 'superAdmin') {
        const superAdmin = await SuperAdmin.findById(obj.id);
        return done(null, superAdmin);
    }
    else if(obj.role === 'patient') {
        const patient = await Patient.findById(obj.id);
        return done(null, patient);
    }
    done(new Error('User role not found'));
});


main().then((res)=>{
    console.log("DB Connected");
})
.catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error"); 
    res.locals.currentUser = req.user;
    res.locals.date= new Date().toLocaleDateString();
    next();
})

app.get("/",(req,res)=>{
    res.render("./user/home.ejs");
})


app.get("/login-doctor",(req,res)=>{
    res.render("./user/doctor-login.ejs");
});

app.get("/signup-doctor",(req,res)=>{
    req.flash("error","You are not allowed to register by yourself. Please contact your hospital admin")
    res.redirect("/");
})

app.post("/login-doctor",passport.authenticate("doctor-local",
    {failureRedirect:"/" , 
    failureFlash:true}), 
    (req,res)=>{
    req.flash("success","welcome back to SwasthyaSankalp!!");
    res.redirect("/doctor-home");
});


app.get("/doctor-home",isDoctorLoggedIn,(req,res)=>{
    res.render("doctor/index.ejs");
})

app.get("/doctor-patient-history",isDoctorLoggedIn,verifyDoctorPatients,async (req,res)=>{
    res.render("doctor/patient-history.ejs");
}) 

app.get("/doctor-patient-appointment",isDoctorLoggedIn,verifyDoctorPatients,async (req,res)=>{
    res.render("doctor/today-appointment.ejs",{allPatient:req.allPatients});
}) 

app.get("/doctor-upcoming-appointment",isDoctorLoggedIn,verifyDoctorPatients,async (req,res)=>{
    res.render("doctor/upcoming-appointment.ejs",{allPatient:req.allPatients});
}) 

app.get("/doctor-profile",isDoctorLoggedIn,(req,res)=>{
    let doctor = req.user;
    res.render("doctor/doctor-profile.ejs",{doctor});
})

app.post("/doctor-profile/update", isDoctorLoggedIn, async (req, res) => {
    try {
        let { name, email, phone, specialization, qualification, experience } = req.body;
        let doctorId = req.user._id;

        await Doctor.findByIdAndUpdate(doctorId, {
            name,
            email,
            phone: parseInt(phone),
            specialization,
            qualification,
            experience: parseInt(experience)
        });

        req.flash("success", "Profile updated successfully");
        res.redirect("/doctor-profile");
    } catch (err) {
        console.log(err);
        req.flash("error", "Error updating profile. Please try again.");
        res.redirect("/doctor-profile");
    }
})

app.get("/prescription/:id",isDoctorLoggedIn,async (req,res)=>{
    let {id} = req.params;
    let doctor = req.user;
    let patient = await Patient.findById(id);
    res.render("doctor/prescription.ejs",{doctor,patient});
})

app.post("/add-prescription",(req,res)=>{
    console.log(req.body);
})


// for Admin

app.get("/login-admin",(req,res)=>{
    res.render("./user/admin-login.ejs");
})

app.get("/signup-admin",(req,res)=>{
    res.render("./user/admin-signup.ejs");
})

app.post("/signup-admin",async (req,res)=>{
    try{
        let {username ,name, email,phone , district , state , hospital , password} = req.body
        let newAdmin = new Admin({username , name , email , phone , district , state , hospital});
        await Admin.register(newAdmin,password);
        res.redirect("/home")
    }catch(err){
        res.redirect("/signup-admin")
    }
});

app.post("/login-admin",passport.authenticate("admin-local",
    {failureRedirect:"/" ,
     failureFlash:true}
    ), 
    (req,res)=>{
    req.flash("success","welcome back to SwasthyaSankalp!!");
    res.redirect("/home");
});

// logOut
app.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged Out");
        res.redirect("/")
    })
})

app.get("/patients-check", isAdminLoggedIn, (req, res) => {
    res.render("admin/admin-existingPatient.ejs");
});

app.post("/patients-check", isAdminLoggedIn, async (req, res) => {
    try {
        let { name, aadhar } = req.body;
        aadhar = aadhar.trim();

        if (!/^\d{12}$/.test(aadhar)) {
            req.flash("error", "Aadhaar must be 12 digits");
            return res.redirect("/patients-check");
        }

        let patient = await Patient.findOne({ aadhar });

        if (patient) {
            req.flash("success", "Patient already registered");
            return res.redirect(`/patient-profile/${patient._id}/view`);
        }

        req.flash("error", "Patient not found. Please register");
        res.redirect(`/new-patient?name=${encodeURIComponent(name || '')}&aadhar=${aadhar}`);

    } catch (err) {
        console.log(err);
        req.flash("error", "Error checking patient");
        res.redirect("/patients-check");
    }
});

app.get("/home",(req,res)=>{
    res.render("admin/admin-home")
})

app.get("/new-patient", isAdminLoggedIn, async (req, res) => {
    let admin = req.user;
    let { name = "", aadhar = "" } = req.query;
    let doctors = await Doctor.find({ admin: admin._id });

    res.render("admin/admin-newPatient.ejs", {
        admin,
        name,
        aadhar,
        doctors
    });
});

app.post("/new-patient", isAdminLoggedIn, async (req, res) => {
    try {
        let { name, age, username, aadhar, disease, district, state, hospital, doctorId, password } = req.body;

        if (!/^\d{12}$/.test(aadhar)) {
            req.flash("error", "Aadhaar must be 12 digits");
            return res.redirect(`/new-patient?name=${encodeURIComponent(name || '')}&aadhar=${aadhar}`);
        }

        let doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            req.flash("error", "Invalid doctor selected");
            return res.redirect(`/new-patient?name=${encodeURIComponent(name || '')}&aadhar=${aadhar}`);
        }

        let newPatient = new Patient({
            name,
            age,
            username,
            aadhar,
            disease,
            district,
            state,
            hospital,
            admin: req.user._id,
            doctor: doctor._id
        });

        await Patient.register(newPatient, password);

        req.flash("success", "Patient registered successfully");
        res.redirect("/home");

    } catch (err) {
        console.log(err);

        if (err.code === 11000) {
            req.flash("error", "Patient already exists");
        } else {
            req.flash("error", "Error creating patient");
        }

        res.redirect("/new-patient");
    }
});


app.get("/patient-history",isAdminLoggedIn, verifyAdminPatients ,async (req,res)=>{
    res.render("admin/admin-patientHistory.ejs", {allPatient:req.allPatients});
})

app.get("/add-doctor",isAdminLoggedIn,(req,res)=>{
    let admin = req.user;
    res.render("admin/admin-doctor.ejs",{admin});
});

app.post("/add-doctor",isAdminLoggedIn,async (req,res)=>{
    let {name , email , phone , specialization , experience , qualification ,district , state , hospital, username, password}= req.body;

    try {
        let registeredDoctor = new Doctor({name , email , phone , specialization , experience , qualification , district , state , hospital, username , admin: req.user._id});
        await Doctor.register(registeredDoctor, password);
        req.flash("success","Doctor added to the system successfully");
        res.status(201).redirect("/home");
    } catch (err) {
        res.status(400).send('Error adding doctor: ' + err.message);
    }

})

app.get("/all-doctor",isAdminLoggedIn,verifyAdminDoctors,async (req,res)=>{
    res.render("admin/doctor-list.ejs",{allDoctor: req.allDoctors});
});

app.get("/admin-profile",isAdminLoggedIn,(req,res)=>{
    let admin = req.user;
    res.render("admin/admin-profile.ejs",{admin});
})

app.get("/patient-profile/:id/view",isAdminLoggedIn,async (req,res)=>{
    let {id} = req.params;
    let patient = await Patient.findById(id);
    let doctor = await Doctor.findById(patient.doctor);
    res.render("admin/patient-profile.ejs",{patient , doctor});
})

app.get("/doctor-profile/:id/view",isAdminLoggedIn,async (req,res)=>{
    let {id} = req.params;
    let doctor = await Doctor.findById(id);
    res.render("admin/doctor-profile.ejs",{doctor});
})


// Super Admin 

app.get("/superAdmin-signup",(req,res)=>{
    res.render("user/superAdmin-signup.ejs");
});

app.post("/superAdmin-signup",async (req,res)=>{
    try{
        let {name,email,phone,username , password} = req.body;
        let newSuperAdmin = new SuperAdmin({name,email,phone,username});
        await SuperAdmin.register(newSuperAdmin , password);
        res.redirect("/superAdmin-home");
    }
    catch(err){
        res.redirect("/superAdmin-signup")
    }
});

app.get("/superAdmin-login",(req,res)=>{
    res.render("user/superAdmin-login.ejs");
});

app.post("/superAdmin-login",passport.authenticate("superAdmin-local",{
    failureRedirect : "/superAdmin-login",
    failureFlash:true
}),(req,res)=>{
    res.redirect("/superAdmin-home");
});

// Enhanced SuperAdmin Dashboard with metrics and policies
app.get("/superAdmin-home", isSuperAdminLoggedIn, async (req, res) => {
    let allPatients = await Patient.find();
    let allPolicies = await Policy.find().sort({ createdAt: -1 });
    let allDoctors = await Doctor.find();
    let allAdmins = await Admin.find();
    
    // Compute metrics
    const totalPatients = allPatients.length;
    const totalDoctors = allDoctors.length;
    const totalHospitals = [...new Set(allPatients.map(p => p.hospital).filter(Boolean))].length;
    const totalDistricts = [...new Set(allPatients.map(p => p.district).filter(Boolean))].length;
    const totalDiseases = [...new Set(allPatients.map(p => p.disease).filter(Boolean))].length;
    const activePolicies = allPolicies.filter(p => p.status === 'active').length;
    
    // Disease distribution for chart
    const diseaseCounts = {};
    allPatients.forEach(p => {
        const d = p.disease || 'Unknown';
        diseaseCounts[d] = (diseaseCounts[d] || 0) + 1;
    });
    
    // Hospital distribution for chart
    const hospitalCounts = {};
    allPatients.forEach(p => {
        const h = p.hospital || 'Unknown';
        hospitalCounts[h] = (hospitalCounts[h] || 0) + 1;
    });
    
    // District distribution for chart
    const districtCounts = {};
    allPatients.forEach(p => {
        const d = p.district || 'Unknown';
        districtCounts[d] = (districtCounts[d] || 0) + 1;
    });
    
    // Monthly patient registration trend
    const monthlyCounts = {};
    allPatients.forEach(p => {
        const month = p.createdAt ? new Date(p.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' }) : 'Unknown';
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    res.render("superAdmin/superAdmin-home.ejs", {
        allPatients,
        allPolicies,
        allDoctors,
        allAdmins,
        metrics: {
            totalPatients,
            totalDoctors,
            totalHospitals,
            totalDistricts,
            totalDiseases,
            totalAdmins: allAdmins.length,
            activePolicies
        },
        charts: {
            diseases: diseaseCounts,
            hospitals: hospitalCounts,
            districts: districtCounts,
            monthly: monthlyCounts
        }
    });
});

// Policy API Routes
app.post("/api/policies", isSuperAdminLoggedIn, async (req, res) => {
    try {
        const { title, description, category, status } = req.body;
        const newPolicy = new Policy({
            title,
            description,
            category,
            status,
            createdBy: req.user._id
        });
        await newPolicy.save();
        res.json({ success: true, policy: newPolicy });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.get("/api/policies", isSuperAdminLoggedIn, async (req, res) => {
    try {
        const policies = await Policy.find().sort({ createdAt: -1 });
        res.json({ success: true, policies });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.put("/api/policies/:id", isSuperAdminLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Policy.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, policy: updated });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.delete("/api/policies/:id", isSuperAdminLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;
        await Policy.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.get("/superAdmin-profile",isSuperAdminLoggedIn,(req,res)=>{
    let superAdmin = req.user;
    res.render("superAdmin/superAdmin-profile.ejs",{superAdmin});
})


// Patient Route

app.post("/patient-login",passport.authenticate("patient-local",{failureRedirect:"/",failureFlash:true}),(req,res)=>{
    res.redirect("/patient-home");
})

app.get("/patient-home",(req,res)=>{
    res.render("patient/patient-home.ejs")
})

app.get("/patient-profile",isPatientLoggedIn,(req,res)=>{
    res.render("patient/patient-profile.ejs",{patient : req.user})
})

app.get("/patient-signup",(req,res)=>{
    res.render("user/patient-signup.ejs");
})

app.post("/patient-signup",async (req,res)=>{
    let {name , age , username ,disease ,district,state ,hospital, doctorName , password} = req.body;
    let newPatient = new Patient({name , age ,username , disease ,district,state ,hospital});
    let doctor = await Doctor.findOne({name: doctorName});
    if(!doctor){
        req.flash("error","The doctor Name you Enter is not registered at SwasthyaSankalp");
        return res.redirect("/patient-signup");
    }
    newPatient.admin = doctor.admin;
    newPatient.doctor = doctor._id;
    await Patient.register(newPatient,password);
    res.redirect("/patient-home");
});

app.get("/patient-myProfile",isPatientLoggedIn,(req,res)=>{
    res.render("patient/patient-profile.ejs",{patient : req.user});
})


app.listen("8080",()=>{
    console.log("Server started at port 8080")
})
