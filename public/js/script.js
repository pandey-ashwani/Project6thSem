let hamBurger = document.querySelector(".hamBurger");
let hamBurgerPage = document.querySelector(".hamBurgerPage");
let hamBurgerPageX = document.querySelector(".hamBurgerPageX");
let profile = document.querySelector(".profile");
let profilePage = document.querySelector(".profilePage");
let profilePageX = document.querySelector(".profilePageX");
let doctor = document.querySelector(".manage-doctor");
let doctorPage = document.querySelector(".doctorPage");
let doctorPageX = document.querySelector(".doctorPageX");

hamBurger.addEventListener("click",()=>{
    hamBurgerPage.style.top = "80px";
})

hamBurgerPageX.addEventListener("click",()=>{
    hamBurgerPage.style.top = "-300px";
})

// profile.addEventListener("click",()=>{
//     profilePage.style.top = "80px";
// })

// profilePageX.addEventListener("click",()=>{
//     profilePage.style.top = "-300px";
// })

doctor.addEventListener("click",()=>{
    doctorPage.style.top = "80px";
})

doctorPageX.addEventListener("click",()=>{
    doctorPage.style.top = "-300px";
})


// Doctor Prescription


// Enhanced prescription JS moved to prescription.ejs for better modularity
// Original functions preserved for other pages if needed




