const validator   = require('validator');
const nodemailer  = require('nodemailer');
const express     = require('express');
const Controller  = express.Router();
const Collections = require.main.require('./models/index');
const Queries     = Collections.Queries;
const smtpConfig  = require.main.require('./config/auth').nodemailer;
const S           = require('string');

Controller.get('/', function (req, res, next) {
    let expose   = {}
    res.render('site/contact/index', expose );
})

Controller.post('/', function (req, res, next) {
    let expose = {}
    let error  = false;


    if(!(req.body.subject))   error = true;
    if(!(req.body.name))      error = true;
    if(!(req.body.email))     error = true;
    if(!(req.body.message))   error = true;

    expose.fields = req.body

    if(!error){

        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport(smtpConfig);

        // setup e-mail data with unicode symbols
        let html  = `<h1>Website enquiry</h1>
                        <p>Name: ${req.body.name}</p>
                        <p>Email: ${req.body.email}</p>
                        <p>Tel: ${req.body.tel}</p>
                        <hr >
                        <p>${req.body.message}</p>
                    ` // html body
        var mailOptions = {
            // from : '"Website Enquiry" <no-reply@${req.host}>', // sender address
            from    : '"Website Enquiry" <no-reply@pre2000.com>', // sender address
            to   : '"Pre2000 Contact Form" <info@pre2000.com>', // list of receivers
        
            subject : `Contact: ${req.body.subject}`, // Subject line
            text    : S(html).stripTags().s, // plain text body
            html    : html
        };


        if(req.env == "development"){
            mailOptions.to = "sam_jarvi@hotmail.co.uk";
        }
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                expose.message = "Error, please make sure all required fields have been completed."
                res.status(409).render('site/contact/index', expose );
            }else{
                console.log('Message %s sent: %s', info.messageId, info.response || info.message.toString());
                expose.message = "Successfully sent, thank you, we will get back to you as soon as possible."
                res.status(200).render('site/contact/thanks', expose );
            }
        });
    }else{
        next("Please make sure you have completed the form correctly and try again.");
    }

})


module.exports = Controller;