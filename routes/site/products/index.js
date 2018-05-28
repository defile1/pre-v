let express     = require('express');
let Controller  = express.Router();
let Collections = require.main.require('./models');
let Queries     = Collections.Queries;
let humanize    = require("underscore.string/humanize");
let S           =  require("string");

Controller.use(function (req, res, next) {
    let query   = req.query || {};
    res.locals.min         = 0;
    res.locals.max         = 150000;


    res.locals.ygte_checked = query.ylte !== void 0;
    res.locals.ylte_checked = query.ygte !== void 0;
    res.locals.lte_checked = query.lte !== void 0;
    res.locals.gte_checked = query.gte !== void 0;

    query.gte              = query.gte || res.locals.min;
    query.lte              = query.lte || res.locals.max;
    query.category         = query.category || [];
    query.brand           = query.brand || [];
    query.ygte             = query.ygte || 1;
    query.ylte             = query.ylte || 2000;
    res.locals.query       = query;

    next();
})
Controller.get('/:YY/:mm/:slug/:id/', function (req, res, next) {
    Promise
    .all([
        Collections.Queries.Site.Products.getWatchById(req.params.id, req.params.slug),
        Collections.Queries.Site.Products.related()
    ])
    .then( results => {
        let [products, related] = results;
        res.locals.products = products;
        res.locals.related = related;
        res.render('site/products/products');
    })
    .catch(next)
})
Controller.get('/', function (req, res, next) {
    let query   = req.query || {};
    let filters = req.query || {};
    let page    = req.query.page || 1;
    let product = {};

    if(filters.search){
        product["$text"] = { $search: req.query.search,$caseSensitive: false, $language:"none"};
    }
    if(filters.ylte || filters.ygte){
        product["year"] = {};
        product["year"]["$lte"] = parseInt(filters.ylte);
        product["year"]["$gte"] = parseInt(filters.ygte);
    }
    if(filters.lte || filters.gte){
        product["prices.price"] = {};
        product["prices.price"]["$lte"] = parseInt(filters.lte);
        product["prices.price"]["$gte"] = parseInt(filters.gte);
    }
    if(filters.brand && filters.brand.length){
        product["brand"] = {};
        product["brand"]["$in"] = filters.brand;
    }
    if(filters.category && filters.category.length){
        let human = S(filters.category).humanize().s;
        product["category"] = {};
        product["category"]["$in"] = human;
    }

    // product["_owners.deleted"] = false;

    Collections.Queries.Site.Products
    .filters(product, page)

    .then((results) => {
        let [products, totals, prices, perPage] = results;
        res.locals.products    = products;
        res.locals.totals      = totals.length;
        res.locals.perPage     = perPage;
        res.locals.page        = parseInt(page);
        res.locals.title       = "Products";
        res.locals.min         = 0;

        res.locals.max         = 150000;

        // res.locals.ygte_checked = query.ylte ;
        // res.locals.ylte_checked = query.ygte ;
        // res.locals.lte_checked = query.lte ;
        // res.locals.gte_checked = query.gte ;
        query.gte              = query.gte || res.locals.min;
        query.lte              = query.lte || res.locals.max;
        query.category         = query.category || [];
        query.brand           = query.brand || [];
        query.ygte             = query.ygte || 1;
        query.ylte             = query.ylte || 2000;
        res.locals.query       = query;
        let isInfinate         = req.header("infinate") == "true";

        if( isInfinate ){
            res.render('site/products/list' );
        }else{
            res.render('site/products/index' );
        }
    })
    .catch(next)
});


module.exports = Controller;