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
    query.gender           = query.gender || [];
    query.ygte             = query.ygte || 1;
    query.ylte             = query.ylte || 2000;
    res.locals.query       = query;

    next();
})

Controller.get('/', function (req, res, next) {
    Collections.Queries.Site.Products
    .getBrands()
    .then((results) => {
        res.locals.brands = results
        res.render('site/products/brands/index');
    })
    .catch(next)
});
Controller.get('/:title/', function (req, res, next) {
    let title = req.params.title;
    let query = req.query || {};
    title = humanize(title);
    Collections.Queries.Site.Products
    .findByBrand(title)
    .then((results) => {
        res.locals.products = results;
        res.locals.totals   = results.length;
        res.render('site/products/index' );
    })
    .catch(next)
});


module.exports = Controller;