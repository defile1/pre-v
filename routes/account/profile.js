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
const fs          = require('fs-extra');




// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/account/login/');
}

Controller.get(['/','/:page/'], isLoggedIn, function(req, res) {
    res.locals.page = req.params.page || "authentication";
    res.locals.user = req.user;

    res.render('account/profile');
})


Controller.put('/authentication/', function(req, res, next) {
    let body       = req.body.users;
    let title      = "Updating profile";

    let password = body.password;
    let confirm = body.confirm;

    if(password && password.length >= 6 && password === confirm){
        req.user.setPassword(password, (error, doc) =>{
            if(error){
                res.locals.message = error;
                return res.json({status: "error", message: error});
            }
            return res.json({status: "success", message: 'Your profile has been saved successfully.', id: req.user.id });
        });
    }else{
        let error      = "Please enter a new password at least 6 characters long.";
        let validation = {"password": {error: error, path: "password"} };
        let json       = {title, error, validation, prefix:"users"}
        res.status(409).json(json);
    }

});
Controller.put('/persons/', function(req, res, next) {
    let body       = req.body.users;
    let title      = "Updating profile";

    req.user.persons.country    = body.persons.country;
    req.user.persons.dob        = body.persons.dob;
    req.user.persons.email      = body.persons.email;
    req.user.persons.name.first = body.persons.name.first;
    req.user.persons.name.last  = body.persons.name.last;
    req.user.persons.title      = body.persons.title;

    var emailRegex = /^[^@]+@[^@]+$/g;
    let isValidEmail =  emailRegex.test(req.user.persons.email);

    if(!isValidEmail){
        let error      = "Invalid email";
        let path       = "persons.email";
        let validation = {email: {error, path} };
        let json       = {title, error,  validation, prefix:"users"}
        return res.status(409).json(json);
    }
    // return res.json({success:"successfully"})
    req.user.save({validateBeforeSave: true})
    .then( user =>{
        res.json({status: "success", message: 'Your profile has been saved successfully.', id: req.user.id })
    })
    .catch(errors => {

        let dev        = {deverror: errors};
        let error      = "Failed to update profile."
        let validation = errors.errors;
        let json       = {title, error, dev, validation, prefix:"users"}
        res.status(409).json(json);
    })

})

Controller.put('/company/', function(req, res, next) {
    let body       = req.body.users;
    let title      = "Updating profile";

    req.user.companies.name    = body.companies.name;
    req.user.companies.website = body.companies.website;
    req.user.companies.tel     = body.companies.tel;
    req.user.companies.email   = body.companies.email;

    if(!req.user.companies.opening) req.user.companies.opening = {}

    req.user.companies.opening.monday    = body.companies.opening.monday;
    req.user.companies.opening.tuesday   = body.companies.opening.tuesday;
    req.user.companies.opening.wednesday = body.companies.opening.wednesday;
    req.user.companies.opening.thursday  = body.companies.opening.thursday;
    req.user.companies.opening.friday    = body.companies.opening.friday;
    req.user.companies.opening.saturday  = body.companies.opening.saturday;
    req.user.companies.opening.sunday    = body.companies.opening.sunday;


    var emailRegex = /^[^@]+@[^@]+$/g;
    let isValidEmail =  emailRegex.test(req.user.companies.email);

    if(!isValidEmail){
        let error      = "Invalid email";
        let path       = "companies.email";
        let validation = {email: {error, path} };
        let json       = {title, error,  validation, prefix:"users"}
        return res.status(409).json(json);
    }
    // return res.json({success:"successfully"})
    req.user.save({validateBeforeSave: true})
    .then( user =>{
        res.json({status: "success", message: 'Your profile has been saved successfully.', id: req.user.id })
    })
    .catch(errors => {

        let dev        = {deverror: errors};
        let error      = "Failed to update profile."
        let validation = errors.errors;
        let json       = {title, error, dev, validation, prefix:"users"}
        res.status(409).json(json);
    })

})


Controller.put('/upload/:type', function(req, res, next){
    let type   = req.params.type;
    let userID = req.user.id;
    let error  = "Unknown";
    let all    = ["companies", "persons"];

    if(!all.includes(type)){
        error = "Wrong file.";
        console.warn("wrong profile upload type:", type, "should be:", all);
        return res.status(409).json({error, code: 0});
    }

    Collections.Queries.Merchants.Users
    .getByID(userID)
    .then((results) => {
        if(!req.files){
            return res.status(409).json({error, code: 1});
        }

        let file = req.files.file;
        let dir = `./public/images/users/${userID}/${type}`;

        fs.ensureDir(dir, function (err) {
            if (err){
                return res.status(409).send(err);
            }

            let newPath = `${dir}/${file.name}`;

            file.mv(newPath, function(err){
                if (err){
                    return res.status(409).send(err);
                }

                let image      = {};
                image.src      = newPath.slice(1);
                image.alt      = ""
                image.deleted  = false;

                results[type].image = image;
                results.markModified(`${type}.image`);

                results
                .save()
                .then(() => {
                    let success = "success"
                    res.json({success});
                })
                .catch(error => {
                    let message = error.message
                    res.status(409).json({error:message, code: 2})
                });
            });
        });
    })
    .catch(error => {
        let message = error.message
        res.status(409).json({error:message})
    })
})

module.exports = Controller;
