const express = require('express');

const routes = express.Router();

const adminctl = require('../controllers/adminctl');
const adminModel = require('../models/AdminModel');

routes.get("/", adminctl.signIn);

routes.post("/adminSignIn", adminctl.adminSignIn);

routes.get("/changePassword", adminctl.changePassword);

routes.post("/ChangeAdminPassword", adminctl.ChangeAdminPassword);
 
routes.get("/dashboard",adminctl.dashboard);

routes.get("/viewAdmin", adminctl.viewAdmin);

routes.get("/addAdmin",adminctl.addAdmin);

routes.post("/insertAdminData",adminModel.uploadAdminImage,adminctl.insertAdminData);

routes.get("/updateAdmin/:adminId", adminctl.updateAdmin);

routes.post("/EditAdminData/:adminId",adminModel.uploadAdminImage, adminctl.EditAdminData);

routes.get("/deleteAdmin", adminctl.deleteAdmin);

// status 

routes.get("/SetInActiveAdmin/:adminId", adminctl.SetInActiveAdmin);

// forgot password

routes.get("/checkEmailPage", adminctl.checkEmailPage);

routes.post("/SendOTP", adminctl.SendOTP);

routes.get('/otpPage', adminctl.otpPage);

routes.post("/verifyOTP", adminctl.verifyOTP);

routes.get("/forgotPassword", adminctl.forgotPassword);

routes.post("/updatePassword", adminctl.updatePassword);

// end forgot password

module.exports = routes;