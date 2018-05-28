// routes/account/index.js
let express      = require('express');
let Controller   = express.Router();
let passport     = require('passport');
let Users        = require.main.require('./models/schemas/users');
let S            = require('string');
let types        = ["merchant","user"];
let Collections  = require.main.require('./models');
const uuidV4     = require('uuid/v4');
const nodemailer = require('nodemailer');



Controller.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

Controller.use((req, res, next)=>{
    if(req.user && req.user.deleted){
        return res.redirect('/suspended');
    }
    next();
})

Controller.get(['/register','/register/:type'], function(req, res) {
    if(req.user) return res.redirect('/account/login/');
    res.locals.type = types.includes(req.params.type)?req.params.type:"user";
    res.render('account/register', { });
});

Controller.post(['/register/','/register/:type'], function(req, res, next) {
    let type = req.params.type || "user";
    res.locals.type = type;
    // return res.json({type})
    let newUser = new Users({ email : req.body.email});
    newUser.username = newUser.persons.email = newUser.email;
    console.info("new user...Registered")
    console.log(newUser.username,newUser.email, newUser.persons.email)
    console.log(newUser)
    Users
    .register(newUser, req.body.password, function(err, account) {
        if (err) {
            return res.render('account/register', { account : account, error: err });
        }

        if(type != "user"){
            let newType = "mm"+(type[0].toUpperCase()+type.slice(1));
            newUser.roles.addToSet(newType);
            newUser.save()
            .then(()=>{
                passport.authenticate("local", function(err, user, info){
                    req.logIn(user, function(err) {
                        if (err) { return next(err); }
                        if(req.header('content-type').includes('application/json')) {
                            let success = true;
                            res.json({success})
                        }else{
                            res.redirect('/account/profile/');
                        }
                    });
                })(req,res, next);
                // res.redirect('/account/profile');
            })
            .catch(next)
        }else{
            passport.authenticate("local", function(err, user, info){
                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    if(req.header('content-type').includes('application/json')) {
                        let success = true;
                        res.json({success})
                    }else{
                        res.redirect('/');
                    }
                });
            })(req,res, next);
        }
    });
});

Controller.get('/login', function(req, res) {
    if(req.user) res.redirect('/');
    res.render('account/login', { user : req.user });
});

Controller.post('/login', function(req, res, next) {
    req.body.email = req.body.email;
    Users.findOne({email: req.body.email})
    .then(user => {
        if(user && user.facebook.id){
            passport.authenticate('facebook', { scope : 'email' })(req, res, next)
        }else{
            passport.authenticate("local", function(err, user, info){
                if (err) { return next(err); }

                if(info && info["message"]){

                    res.status(401).render('account/login',{error: info.message});
                    return false;
                }

                if (!user) { return res.redirect('/login/'); }

                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    if(req.header('content-type').includes('application/json')) {
                        let success = true;
                        res.json({success})
                    }else{
                        res.redirect('/');
                    }
                });
            })(req, res, next)
        }
    })
    .catch(next)

});



module.exports = Controller;
