var
Collections = require.main.require('./models/index'),
Publishers  = Collections.Publisher,
Watches     = Collections.Watches,
Queries     = Collections.Queries,
Users       = Collections.Users,
express     = require('express'),
_           = require('underscore'),
Controller  = express.Router()
;

// Controller.use(function (req, res, next) {
//     res.locals.stores = {}

//     if(req.user){
//         res.locals.user = req.user
//         res.locals.stores.user = req.user.toJSON();
//         next();
//     }else{
//         req.requireLogin();
//         res.end();
//     }
// });

Controller.get('/', function(req, res, next){
    let id = req.params.id;

    Collections
    .Schemas
    .Users
    .find({roles: 'mmMerchant'})
    .then(results => {
        res.locals.title   = "List of Merchant users";
        res.locals.roles = ('mmMerchant');
        res.locals.users = results;
        res.render('./management/merchuser')
    })
    .catch(next)
});

Controller.get('/remove-merchant/:id/', function(req, res, next){
    let id = req.params.id;

    Collections
    .Schemas
    .Users
    .findOne({_id: id})
    .then(results => {
        let merchantIndex = results.roles.indexOf('mmMerchant');

        if(merchantIndex > -1){
            results.roles.splice(merchantIndex, 1);
        }

        results.save()
        .then(user=>{
            res.redirect('/management/merchuser/');
        })
        .catch(next)
    })
    .catch(next)
});
Controller.get('/make-merchant/:id/', function(req, res, next){
    let id = req.params.id;

    Collections
    .Schemas
    .Users
    .findOne({_id: id})
    .then(results => {
             let merchantIndex = results.roles.indexOf('mmUser');

        if(merchantIndex > -1){
            results.roles.push('mmMerchant');
        }

        results.save()
        .then(user=>{
            res.redirect('/management/merchuser/');
        
        })
        .catch(next)
    })
    .catch(next)
});
Controller.get('/disable/:id/', function(req, res, next){
    let id = req.params.id;

    Collections
    .Schemas
    .Users
    .findOne({_id: id})
    .then(results => {
        results.deleted = !results.deleted;
        results.save()
        .then(user=>{
            res.redirect('/management/merchuser/');
        })
        .catch(next)
    })
    .catch(next)
})
Controller.get('/:id/', function(req, res, next){
    // Queries
    // .PublisherWatches
    // .getAllRecent(req.user.id)
    // .then(results => {
    //     res.locals.title   = "Publisher";
    //     res.locals.watches = results;
    //     res.locals.head    = {
    //         js :[],
    //         css:["watches"]
    //     }
    //     console.log('here')
    // })
    // .catch(next)

    let id = req.params.id;

    Collections
    .Schemas
    .Users
    .findOne({_id: id})
    .then(result => {
        res.locals.user = result;
        res.render('./management/user/single-user');
    })
    .catch(next);
});


module.exports = Controller