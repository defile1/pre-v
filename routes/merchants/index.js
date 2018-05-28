let express    = require('express');
let Controller = express.Router();
let Models     = require.main.require('./models');

Controller.use(function(req, res, next){
    if(req.user && req.user.deleted){
        return res.redirect('/suspended');
    }
     // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/account/login/');
})
Controller.use(function(req, res, next){
    if (!req.url.includes("profile") && !req.user.isValidMerchant) return res.redirect("/account/profile/");
    next();
})
Controller.use(function(req, res, next){

    let isMerchant = req.user && req.user.isMerchant;

    if(!isMerchant) console.warn("isMerchant: ", isMerchant, req.user.id);

    if(isMerchant){
        next();
    }else{
        res.redirect("/");
    }
})
Controller.use(function(req, res, next){
    let categories = res.locals.Stores.Enums.Products.categories;
    res.locals.categories = categories.filter((item,index)=> {return item.active != false }).map(function(item, index ){return item.title;});
    res.locals.isCategory = (category) =>{
        return res.locals.Stores.Enums.Products.categories
        .filter(function(item, index ){
            return item.title.toLowerCase() === category.toLowerCase();
        }).length === 1;
    }
    next();
})
Controller.get('/', function(req, res, next){
    Promise
    .all([
        Models.Queries.Merchants.Products.getAllRecent(req.user.id),
        Models.Queries.Merchants.Offers.getAllRecent(req.user.id),
        Models.Queries.Merchants.Products.getAllCount(req.user.id),
        Models.Queries.Merchants.Offers.getAllCount(req.user.id)
    ])
    .then((results) => {
        let [products, offers, productsCount, offersCount] = results;

        let stats = {}
        stats.offers = offersCount;
        stats.products = productsCount;

        res.locals.title   = "Merchant's Dashboard";
        res.locals.products = products;
        res.locals.offers = offers;
        res.locals.stats = stats;

        res.render('merchants/index')
    })
    .catch(next)
});

Controller.get('/search', function(req,res){
    var term = new RegExp(req.query.search, 'i')

    Models.Queries.Merchants.Products
    .searchWatches(term)
    .then(result => {
        res.json(result);
    })
    .catch(error => {
        res.status(409).json({error})
    })
});

module.exports = Controller
