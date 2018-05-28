let express    = require('express');
let Controller = express.Router();
let Models     = require.main.require('./models');

// special case for site index, as we don't want people to use the `/site` on url
Controller.use(function (req, res, next) {
    var Site = {};
    Site.noPhoto = "/public/images/photo_not_available.jpg";
    res.locals.Site = Site;

    res.locals.Stores = {
        Descriptors : {},
        Schemas     : {},
        Collections : {},
        Data        : {},
        Enums       : Models.Enums,
    }
    next();
});

Controller.use(function (req, res, next) {
    let sessionID = req.sessionID;
    Models.Queries.Notifications
    .getAll(sessionID)
    .then(function (results) {
        req.notifications = results.map( item => item.toJSON())
        next()
    })
    .catch(next);
});


Controller.use(function (req, res, next) {
    if(req.user){
        res.locals.url                              = {}
        res.locals.url.path                         = req.path
        res.locals.url.full                         = req.originalUrl
        res.locals.CurrentUser                      = req.user

        res.locals.Stores.Data.Notifications        = {"schemaName": "Notifications", "data": req.notifications};
        res.locals.Stores.Data.CurrentUser          = {"schemaName": "Users", "data": [req.user.toJSON()]};
        res.locals.Stores.Descriptors               = {};
        res.locals.Stores.Descriptors.Users         = Models.Descriptors.BrowserSide.Users;
        res.locals.Stores.Descriptors.Notifications = Models.Descriptors.BrowserSide.Notifications;
    }
    next();
});

module.exports = Controller;