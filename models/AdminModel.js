const mongoose = require('mongoose')

const adminImage = "/uploads/adminsImages";
const multer = require('multer');
const path = require('path');

const adminSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true
    },
    hobby:{
        type: Array,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    profile:{
        type: String,
        required: true
    },
    status:{
        type: Boolean,
        default: true,
        required: true
    },
    created_date : {
        type: String,
        required: true
    },
    updated_date : {
        type: String,
        required: true
    },
});

const storageAdmin = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null,path.join(__dirname,"..",adminImage))
    },
    filename : (req,file,cb) => {
        cb(null,file.fieldname+"-"+Date.now());
    }
})

adminSchema.statics.uploadAdminImage = multer({storage : storageAdmin}).single('profile');
adminSchema.statics.adminPath = adminImage;

const Admin = mongoose.model('Admin',adminSchema);

module.exports = Admin;