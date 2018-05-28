let express     = require('express');
let Controller  = express.Router();
let fs          = require('fs');
let Collections = require.main.require('./models/index');


Controller
.use(function(req, res, next){
    res.locals.Stores.Descriptors.Products = Collections.Descriptors.BrowserSide.Products
    res.locals.Stores.Descriptors.Offers = Collections.Descriptors.BrowserSide.Offers
    next();
})
Controller
.get('/new', function(req, res, next){
    Collections.Queries.Merchants.Offers.create();
    res.locals.Stores.Data.Offers = {"schemaName": "Offers", "data": []};
    res.render('./merchants/offers.njk');
})
.get('/:id', function(req, res, next){
    Collections.Queries.Merchants.Offers
    .getOfferByID(req.params.id, req.user.id)
    .then(results => {
        res.locals.Stores.Data.Offers = {"schemaName": "Offers", "data": [results.toJSON()]};
        res.render('./merchants/templates/offers/messages.njk');
    })
    .catch(next)

})
.get('/', function(req, res, next){

    Collections.Queries.Merchants.Offers
    .getAll(req.user.id)
    .then(results => {

        res.locals.title    = "Manage offers";
        res.locals.Stores.Data.Offers = {"schemaName": "Offers", "data": results};
        res.render('./merchants/offers.njk');
    })
    .catch(next)
})

.put('/:id', function(req, res, next){//update
    let ID      = req.params.id;
    let ownerID = req.user.id;
    let body    = req.body;
    let title   = "Updating messages";

    let props     = {}
    props.message = body.message
    props.from    = ownerID

    Collections.Queries.Merchants.Offers
    .findOneAndUpdateMessage({ _id: ID, to : ownerID, deleted: false }, props )
    .then((result) => {
        let success = true;
        let id      = result.id;
        res.json({success, id})
    })
    .catch((errors)=>{
        let dev   = {deverror: errors.errors};
        let title = "Failed to add new message."
        let error = errors.errors;
        let json  = {title, error, dev}
        res.status(409).json(json);
    })
})

module.exports = Controller