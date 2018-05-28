// routes/account/index.js
const express     = require('express');
const Controller  = express.Router();
const Users       = require.main.require('./models/schemas/users');
const S           = require('string');
const uuidV4      = require('uuid/v4');
const nodemailer  = require('nodemailer');



Controller.get('/', function(req, res){
    res.render('account/forgot-password');
});
Controller.get('/:token/', function(req, res, next){
    let token         = req.params.token;
    let currentDate   = new Date();
    let twentyMinutes = new Date(currentDate.getTime() - (20 * 60 * 1000));
    let query = {
        "forgotPassword.token" : token,
        "forgotPassword.date": {
            "$gte": twentyMinutes,
            "$lte": currentDate,
        }
    };

    res.locals.token = token;
    Users
    .findOne(query)
    .then(user => {
        if(user){
            res.render('account/forgot-password-reset');
        }else{
            res.locals.message = "Something has gone wrong, please try to restart the process of forgot password from beginning."
            console.log("Possible hack attempt, user not found.")
            console.log("Token: %s", token)
            res.render('account/forgot-password');
        }
    })
    .catch(next);
})
Controller.post('/:token/', function(req, res, next){
    let token    = req.params.token;
    let email    = req.body.email;
    let password = req.body.password;
    let confirm  = req.body.confirm;

    if(!password || password.length < 6 || confirm !== password){
        res.locals.message = "Please make sure that passwords match and are at least 6 characters long.";
        return res.render('account/forgot-password-reset');
    }

    let currentDate   = new Date();
    let twentyMinutes = new Date(currentDate.getTime() - (20 * 60 * 1000));

    let query = {
        "forgotPassword.token" : token,
        "forgotPassword.date": {
            "$gte": twentyMinutes,
            "$lte": currentDate,
        },
        "email" : email
    };

    Users
    .findOne(query)
    .then(user => {
        if(user){
            user.setPassword(password, (error, doc) =>{
                if(error){
                    res.locals.message = error;
                    return res.render('account/forgot-password-reset');
                }
                doc.forgotPassword = {
                    token : "",
                    date : twentyMinutes,
                    tries : 0,
                }

                doc
                .save({validateBeforeSave: false})
                .then(doc => {
                    res.locals.message = "Your password has been reset successfully.";
                    return res.render('account/forgot-password-reset');

                })
                .catch(next)

            });
        }else{
            res.locals.message = "Failed to update the password, please restart the forgot password process.";
            res.render('account/forgot-password-reset');
        }
    })
    .catch(next);
})
Controller.get('/:token/cancel/', function(req, res, next){
    // cancel
    let token = req.params.token;
    let query = {
        "forgotPassword.token" : token
    };

    let currentDate   = new Date();
    let twentyMinutes = new Date(currentDate.getTime() - (20 * 60 * 1000));

    Users
    .findOne(query)
    .then(user => {
        res.locals.message = "Your account is now safe, you don't need to do anything else.";

        if(user){
            user.forgotPassword = {
                token : "",
                date : twentyMinutes,
                tries : 0,
            }
            user
            .save({validateBeforeSave: false})
            .then(doc => {

                res.render('account/forgot-password');
            })
            .catch(next);
        }else{
            console.log("Possible hack attempt, user not found.")
            console.log("Token: %s", token)
            res.render('account/forgot-password');
        }
    })
    .catch(next);
});
Controller.post('/', function(req, res, next){

    Users
    .findOne({ email : req.body.email})
    .then(user =>{
        res.locals.message = `An email will be sent to you shortly with the
        information, to reset your password. Please check your Junk folder
        as sometimes the email may end up there depending on your security settings.`;
        if(user && user.isFacebook){
            res.locals.message = "You are a facebook user, we do not store your password. If you wish to change your password please visit facebook.com";
        }
        if(user){
            let random = uuidV4();
            let tries = (user.forgotPassword && user.forgotPassword.tries++) || 1;

            user.forgotPassword = {token: random, date : new Date(), tries: tries};
            user.save()
            .then(doc => {
                // debugger
                var smtpConfig = require.main.require('./config/auth').nodemailer;
                var transporter = nodemailer.createTransport(smtpConfig);
                let linkNegative = `https://${req.hostname}/account/forgot-password/${random}/cancel/`;
                let linkPositive = `https://${req.hostname}/account/forgot-password/${random}/`;
                let html = `
                <h1>Hi ${user.persons.name.first || user.email},</h1>
                <p>You have recently requested a password reset, please visit the link below by copy and pasting it onto a web browser.</p>
                <p>${linkPositive}</p>
                <p>If you did not do such a thing, please visit the link below by copy and pasting this onto your web-browser.</p>
                <p>${linkNegative}</p>
                `;
                let mailOptions = {
                    from: '"Pre 2000" <info@pre2000.com>', // sender address
                    to: req.body.email, // list of receivers
                    subject: 'Password reset from Pre 2000!', // Subject line
                    text: S(html).stripTags().s, // plain text body
                    html: html // html body
                };

                if(req.env == "development"){
                    mailOptions.to = "valtid@mountmedia.co.uk";
                }

                transporter.verify(function(error, success) {
                    // debugger
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Server is ready to take our messages');
                    }
                });

                transporter.sendMail(mailOptions, (error, info) => {
                    // debugger
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Random %s Message %s sent: %s', random, info.messageId, info.response || info.message.toString());
                    console.info(linkNegative)
                    res.render('account/forgot-password');
                });
            })
            .catch(next);

        }else{
            console.warn("possible hack attempt, email not found on forgot password section: ", req.body.email);
            res.render('account/forgot-password');
        }

    })
    .catch(next);

});
module.exports = Controller;
