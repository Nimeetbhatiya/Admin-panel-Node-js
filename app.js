const express = require('express');

const port = 8001;

const app = express();
const path = require('path');

const db = require("./config/mongoose");

const cookieParser = require('cookie-parser');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded());

app.use(cookieParser());

app.use(express.static(path.join(__dirname,'assests')));
app.use("/uploads", express.static(path.join(__dirname,'uploads')));

app.use("/",require('./routes'));

app.listen(port, (err) => {
    err?console.log(err):console.log('Server is running on port:',port);
})