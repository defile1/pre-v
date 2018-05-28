let passport         = require('passport');
let LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
let uuid             = require('uuid');
let session          = require('express-session');
let Users            = require.main.require('./models/schemas/users');
let User             = Users;
let mongoose         = require('mongoose');
var MongoStore       = require('connect-mongo')(session);
// load the auth variables
let configAuth       = require.main.require('./config/auth');

let fbCb = function(req, token, refreshToken, profile, done) {
    // asynchronous
    process.nextTick(function() {
        // find the user in the database based on their facebook id
        let getUser = new Promise((resolve, reject)=>{
            if(req.user){
                resolve(req.user);
            }else{
                User.findOne({ 'facebook.id' : profile.id })
                .then(fbUser => {
                    if(!fbUser){
                        resolve( new User());
                    }else{
                        resolve(fbUser);
                    }
                })
                .catch(reject)
            }
        })

        getUser
        .then(function(fbUser) {
            // if the user is found, then log them in
            if (fbUser.facebook.token) {
                return done(null, fbUser); // user found, return that user
            } else {
                // if there is no user found with that facebook id, create them
                // set all of the facebook information in our user model
                fbUser.facebook.id        = profile.id; // set the users facebook id
                fbUser.facebook.token     = token; // we will save the token that facebook provides to the user
                fbUser.facebook.name      = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                fbUser.facebook.email     = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                fbUser.email              = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                fbUser.persons.email              = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                fbUser.persons.name.first = profile.name.givenName;
                fbUser.persons.name.last  = profile.name.familyName;
                fbUser.persons.gender     = profile.gender;
                // save our user to the database
                fbUser.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, fbUser);
                });
            }

        })
        .catch(done);
    });

}

module.exports = function (app) {
    app.use(session({
        genid: function(req) {    return uuid.v4(); /* use UUIDs for session IDs */  },
        secret: '~hxC$Aa{A0joTBf!&EcT{KR*#Jwq87)|~<TAs /_Rs1idOm,}#{Vk}SI;.5jdO-Y',
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        maxAge: new Date(Date.now() + 3600000)
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // passport config
    var Users = require.main.require('./models/schemas/users');
    let strategy = Users.authenticate();

    passport.use(new LocalStrategy({usernameField : 'email'},strategy))
    // passport.serializeUser(Users.serializeUser());
    // passport.deserializeUser(Users.deserializeUser());

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


     passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID          : configAuth.facebookAuth.clientID,
            clientSecret      : configAuth.facebookAuth.clientSecret,
            callbackURL       : configAuth.facebookAuth.callbackURL,
            passReqToCallback : true ,
            profileFields     : ['id', 'emails', 'name',"gender"]
        }, fbCb));

}