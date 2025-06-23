
const bcrypt = require('bcrypt');
const adminModel = require('../models/AdminModel');
const nodemailer = require("nodemailer");

const moment = require('moment');

const path = require('path');

const fs = require('fs');

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
    let allAdminData = await adminModel.find();
    // console.log(allAdminData);
     if(req.cookies.admin !== undefined){ 
    return res.render('viewAdmin',{allAdminData,adminData : req.cookies.admin})
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

module.exports.SendOTP = async(req,res) => {
    try{
        // console.log(req.body);
        let checkEmail = await adminModel.findOne({email:req.body.email});
        if(checkEmail){
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
        from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
        to: "bar@example.com, baz@example.com",
        subject: "Hello ✔",
        text: "Hello world?", // plain‑text body
        html: "<b>Hello world?</b>", // HTML body
    });
            
        }else{
            console.log("Email not found!!");
        }
        return res.redirect('/admin/checkEmailPage');
    }
    catch(err){

    }
}
// end forgot password