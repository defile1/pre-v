var express         = require('express');
var passport        = require('passport');
var Controller      = express.Router();
var Collections     = require.main.require('./models/index');

Controller.get('/', function(req, res, next) {
    if (!req.user) res.redirect('/account/login');

    Collections.Queries.Merchants.Users
    .getByID(req.user.id)
    .then(function(doc){

        res.locals.title = "Account";
        res.locals.Stores.Descriptors.Users  = Collections.Descriptors.BrowserSide.Users;

        res.render('./merchants/messages')
    })
    .catch(next);
})
module.exports = Controller;