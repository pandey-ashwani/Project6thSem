const Doctor = require("./model/doctor.js");
const Patient = require("./model/patient.js");


// Admin Authentication
module.exports.isAdminLoggedIn = (req,res,next)=>{
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
        
    }
    req.flash('error', 'You need to be an admin to access this page.');
    res.redirect('/');
}


// Doctor Authentication
module.exports.isDoctorLoggedIn = (req,res,next)=>{
    if (req.isAuthenticated() && req.user.role === 'doctor') {
        return next();
    }
    req.flash('error', 'You need to be a doctor to access this page.');
    res.redirect('/');
}


// SuperAdmin Authentication
module.exports.isSuperAdminLoggedIn = (req,res,next)=>{
    console.log("********************************")
    if (req.isAuthenticated() && req.user.role === 'superAdmin') {
        return next();
    }
    req.flash('error', 'You need to be a SuperAdmin to access this page.');
    res.redirect('/superAdmin-login');
}

// Patient Authentication
module.exports.isPatientLoggedIn = (req,res,next)=>{
    if (req.isAuthenticated() && req.user.role === 'patient') {
        res.locals.currentUser = req.user;
        return next();
    }
    req.flash('error', 'You need to Log in to access this page.');
    res.redirect('/');
}


module.exports.verifyAdminDoctors = async (req, res, next) => {

    try {
        // Assuming the admin's ID is stored in req.user or similar
        const adminId = req.user._id; // Adjust based on your authentication setup

        // Fetch doctors created by this admin
        const allDoctors = await Doctor.find({ admin: adminId });

        // Attach doctors to the request object for further use in the route
        req.allDoctors = allDoctors;

        // Call the next middleware/route handler
        next();
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports.verifyAdminPatients = async (req, res, next) => {

    try {
        const adminId = req.user._id;
        const allPatients = await Patient.find({ admin: adminId });
        req.allPatients = allPatients;
        next();
    } 
    catch (error) {
        console.error('Error fetching Patients:', error);
        return res.status(500).send('Internal Server Error');
    }
};


module.exports.verifyDoctorPatients = async (req, res, next) => {

    try {
        const doctorId = req.user._id;
        const allPatients = await Patient.find({ doctor: doctorId });
        req.allPatients = allPatients;
        next();
    } 
    catch (error) {
        console.error('Error fetching Patients:', error);
        return res.status(500).send('Internal Server Error');
    }
};


module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.saveUrl = req.session.redirectUrl;
    }
    return next();
}