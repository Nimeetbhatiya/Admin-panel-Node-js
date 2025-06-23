const express = require('express');

const routes = express.Router();


routes.use('/admin', require('./adminroutes'));
module.exports = routes;