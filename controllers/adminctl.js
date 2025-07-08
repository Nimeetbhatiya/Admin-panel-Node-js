
const bcrypt = require('bcrypt');
const adminModel = require('../models/AdminModel');
const nodemailer = require("nodemailer");

const moment = require('moment');

const path = require('path');

const fs = require('fs');
const { log } = require('console');

module.exports.dashboard = (req,res) => {
    //  console.log("admin dashboard");
    console.log(req.cookies.admin)
    if(req.cookies.admin !== undefined){ 
    return res.render('dashboard',{adminData : req.cookies.admin});
    }
    else{
        return res.redirect('/admin');
    }
}


module.exports.viewAdmin = async (req,res) => {

    let page = 0;
     if(req.query.page){
        page = req.query.page;
     }

     let search = '';
     if(req.query.adminSearch){
        search = req.query.adminSearch;
     }



    let perPage = 2;
    let allAdminData = await adminModel.find({
        name : {$regex : search, $options: "i"}
   }).skip(page*perPage).limit(perPage);

    let CountAllAdminData = await adminModel.find({
        name : {$regex : search, $options: "i"}
   }).countDocuments();


    let totalPage = (Math.ceil(CountAllAdminData/perPage));

    // console.log(allAdminData);
     if(req.cookies.admin !== undefined){ 
    return res.render('viewAdmin',{allAdminData,totalPage,search,page,adminData : req.cookies.admin})
    }
    else{
        return res.redirect('/admin');
    }
}

module.exports.addAdmin = (req,res) => {
     if(req.cookies.admin !== undefined){ 
        return res.render('addAdmin',{adminData : req.cookies.admin})
    }
    else{
        return res.redirect('/admin');
    }
}

module.exports.insertAdminData = async (req,res) => {
    try{
        // console.log(req.body);
        // console.log(req.file);
        req.body.name = req.body.firstName+" "+req.body.lastName;
        req.body.password = await bcrypt.hash(req.body.password,10);
        if(req.file){
            req.body.profile = adminModel.adminPath+"/"+req.file.filename;
        }
        req.body.created_date = moment().format('DD/MM/YYYY,h:mm:ss a');
        req.body.updated_date = moment().format('DD/MM/YYYY,h:mm:ss a');
        let addAdminData = await adminModel.create(req.body);
        if(addAdminData){  
            console.log("Admin Data inserted successfully")
        } else {
            console.log("Admin Data not inserted ")
        }
        return res.redirect("/admin/addAdmin");
    }
    catch(err){
        console.log(err);
        return res.redirect('/admin/addAdmin')
    }
}


// update functionionality , single admin find

module.exports.updateAdmin = async (req,res) => {
    try{
        let adminId = req.params.adminId
        let singleAdmin = await adminModel.findById(adminId);
        if(singleAdmin){
            return res.render('updateAdmin',{singleAdmin,adminData : req.cookies.admin});
        } else {
            console.log("Record not found");
            return res.redirect("/admin/viewAdmin");
        }
    }
    catch(err){
        console.log(err);
        return res.redirect("/admin/viewAdmin");
    }
}

// edit Admin data
module.exports.EditAdminData = async (req,res) =>{
    try{
        let oldAdminData = await adminModel.findById(req.params.adminId);
        if(oldAdminData){
            if(req.file){
                try{
                    var imagePath = path.join(__dirname,'..',oldAdminData.profile);
                    await fs.unlinkSync(imagePath);
                }
                catch(err){
                    console.log("old image not found")
                }
                req.body.profile = adminModel.adminPath+"/"+req.file.filename;
            }
                req.body.name = req.body.firstName+" "+req.body.lastName;
                let editAdminDetails = await adminModel.findByIdAndUpdate(req.params.adminId,req.body);
                if(editAdminDetails){
                    console.log("Admin Data Updated");
                }
                else{
                    console.log("Admin record not updated");
                }
                return res.redirect('/admin/viewAdmin');
        }
        else{
            console.log("Record Not Found");
            return res.redirect("/admin/viewAdmin");
        }
    }
    catch(err){
        console.log(err);
        return res.redirect("/admin/viewAdmin");
    }
}

module.exports.deleteAdmin = async(req,res) =>{
    try{
        let oldAdminData = await adminModel.findById(req.query.adminId);
        if(oldAdminData){
            try{
             var imagePath = path.join(__dirname,'..',oldAdminData.profile)
            await fs.unlinkSync(imagePath);
            }
            catch(err){
                console.log("image not found");
            }

            let  deleteAdmin = await adminModel.findByIdAndDelete(oldAdminData.id);
            if(deleteAdmin){
                console.log("Admin Deleted Successfully");
            }
            else{
                console.log("Record not deleted");
            }
            return res.redirect('/admin/viewAdmin');
        }else{
         console.log("record not found");
        return res.redirect("/admin/viewAdmin");
        }
    }
    catch(err){
        console.log(err);
        return res.redirect("/admin/viewAdmin");
    }
}

module.exports.SetInActiveAdmin = async (req,res) =>{
    try{
        let oldAdminData = await adminModel.findById(req.params.adminId);
        if(oldAdminData){
            let updateStatus = await adminModel.findByIdAndUpdate(oldAdminData.id,{status:!oldAdminData.status});
            if(updateStatus){
            console.log("Admin Status Updated");
            }
            else{
                console.log("something wrong");
            }
        return res.redirect("/admin/viewAdmin");
        }
        else{
        console.log("Record Not found");
        return res.redirect("/admin/viewAdmin");
        }
    }
    catch(err){
        console.log(err);
        return res.redirect("/admin/viewAdmin");
    }
}

// searching start

module.exports.SearchAdminData = async (req,res) => {
    try{
        let search = '';

        if(req.query){
            search = req.query.adminSearch;
        }

        

        let searchAllRecord = await adminModel.find({
          $or: [
            { name : {$regex : search, $options: "i"}},
            { phone : {$regex : search} }
          ]
        })
         if (req.cookies.admin !== undefined) {
            return res.render('viewAdmin', {
                allAdminData: searchAllRecord,
                adminData: req.cookies.admin
            });
        } else {
            return res.redirect('/admin');
        }
    }
    catch(err){
        console.log(err);
        return res.redirect("/admin/viewAdmin");
    }
}

// searching end

// sign in page 

module.exports.signIn = async (req,res) =>{
try{
    return res.render("signIn");
}
catch(err){
     console.log(err);
     return res.redirect("/admin/viewAdmin");
   }
}

module.exports.adminSignIn = async(req,res) => {
    try{
        // console.log(req.body);
        let checkAdmin = await adminModel.find({'email': req.body.email}).countDocuments();
        if(checkAdmin==1){
            let getAdminData = await adminModel.findOne({email:req.body.email});
            if (await bcrypt.compare(req.body.password,getAdminData.password))
                {
                // console.log(getAdminData);
                // console.log("login successfully");
                res.cookie('admin',getAdminData);
                return res.redirect("/admin/dashboard");
            }
            else{
                console.log("invalid Password")
                return res.redirect("/admin/");
            }
        }
        else{
            console.log("Invalid email");
            return res.redirect("/admin/");
        }
    }
    catch(err){
     console.log(err);
     return res.redirect("/admin/");
    }
}

module.exports.changePassword = async(req,res) => {
    try{
        return res.render('changePassword',{adminData : req.cookies.admin});
    }
    catch(err){
         console.log(err);
         return res.redirect("/admin/dashboard");
    }
}

module.exports.ChangeAdminPassword = async(req,res) => {
    try{
        console.log(req.body);
        let Admindata = req.cookies.admin;
        console.log(Admindata);
        if(await bcrypt.compare(req.body.opass,Admindata.password)){
            if(req.body.opass!== req.body.npass){
                if(req.body.npass == req.body.cpass){
                    let npassEncrypt = await bcrypt.hash(req.body.npass,10);
                    let updateAdminPass = await adminModel.findByIdAndUpdate(Admindata._id,{password : npassEncrypt});
                    if(updateAdminPass){
                        res.clearCookie('admin');
                        return res.redirect('/admin/');
                    }  
                    else{
                        console.log("Something wrong!!")
                    } 
                }
                else{
                    console.log("New and confirm are nto match")
                }
            }
            else{
                console.log("Current and New are same");
            }
        }
        else{
            console.log("Current Password not match");
        }
        return res.redirect("/admin/ChangePassword");
    }
    catch(err){
        console.log(err);
        return res.redirect("/admin/dashboard");
    }
}

// forgot password
module.exports.checkEmailPage = async(req,res) =>{
    try{
        return res.render('forgotPassword/checkEmailpage');
    }
    catch(err){

    }
}

function getOTP(){
            let otp = (Math.round(Math.random()*1000000)).toString();
            // console.log(otp.length);

            if(otp.length==6){
                return newOTP = otp;
            }
            else{
                getOTP();
            }             
}

module.exports.SendOTP = async(req,res) => {
    try{
        // console.log(req.body);
        let checkEmail = await adminModel.findOne({email:req.body.email});


        if(checkEmail){
            let otp = getOTP();
            res.cookie('otp',otp);
            res.cookie('email',req.body.email);

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "nimeetbhatiya7635@gmail.com",
                    pass: "njhnkiuueouezssc",
                },
    });

        const info = await transporter.sendMail({
        from: 'nimeetbhatiya7635@gmail.com',
        to: req.body.email,
        subject: "Your OTP is here",
        text: "OTP", // plain‑text body
        html: `<b>OTP : ${otp}</b>`, // HTML body
    });
        if(info){
            return res.redirect('/admin/otpPage')
         }
          else{
            console.log("Server Error");
         }
            
        }
        else{
            console.log("Email not found!!");
        }
        return res.redirect('/admin/checkEmailPage');
    }
    catch(err){

    }
}

module.exports.otpPage = async(req,res) => {
    try{
        return res.render('forgotPassword/otpPage');
    }
    catch(err){

    }
}


module.exports.verifyOTP = async(req,res) => {
    try{
        let cookieOTP = req.cookies.otp;
        if(cookieOTP == req.body.otp){
            // console.log("RIGHT");
            return res.redirect('/admin/forgotPassword');
        } else {
            console.log("OTP not Match!!");
            return res.redirect('/admin/otpPage');
        }
    }
    catch(err){

    }
}

module.exports.forgotPassword = async(req,res) => {
    try{
        return res.render('forgotPassword/forgotPassword'); 

    } 
    catch(err) {

    }
}

module.exports.updatePassword = async(req,res) => {
    try{
        console.log(req.body);
        if(req.body.npass == req.body.cpass){
            
            let cookieEmail = req.cookies.email;
            let adminData = await adminModel.findOne({email:cookieEmail});
            let encryptPassword = await bcrypt.hash(req.body.npass,10);
            let updateAdmin = await adminModel.findByIdAndUpdate(adminData._id,{password : encryptPassword});
            if(updateAdmin){
                
                res.clearCookie('otp');
                res.clearCookie('email');
                res.clearCookie('admin');
                return res.redirect('/admin')
            }
        } else{
            console.log("Password not match");
            return res.redirect("/admin/forgotPassword");
        }
    } 
    catch(err) {
            console.log(err);
    }
}
// end forgot password  
