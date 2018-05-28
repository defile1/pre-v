// routes/account/index.js
let express      = require('express');
let Controller   = express.Router();
let passport     = require('passport');
let Users        = require.main.require('./models/schemas/users');
let S            = require('string');
let types        = ["merchant","user"];
let Collections  = require.main.require('./models');



// facebook -------------------------------
Controller.get('/unlink/', function(req, res) {
    var user            = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
        res.redirect('/account/profile');
    });
});

// handle the callback after facebook has authenticated the user
Controller.get('/callback', passport.authenticate('facebook', {
        successRedirect : '/account/profile',
        failureRedirect : '/account/login',
        scope : 'email'
    })
);
// route for facebook authentication and login
Controller.get('/', passport.authenticate('facebook', { scope : 'email' }));

module.exports = Controller;
