let express     = require('express');
let Controller  = express.Router();
let fs          = require("fs");
let Collections = require.main.require('./models');


Controller.use(function(req, res, next){
    if(req.user){
        res.locals.user = req.user
    }
    next();
})

Controller.get('/*', function (req, res, next) {
    if(req.query.s !== void 0){
        next();
    }else{
        let path   = req.path.replace(/\/?$/, "")
        let isPage = false;

        try{

            isPage = fs.statSync(`./views/site/_pages/${path}.njk`)

        }catch(e){

        }

        if(isPage){
            res.render("site/pages", {page : path })
        }else{
            if(path == ""){
                Collections.Queries.Site.Products.count()
                .then(results => {
                    let [products, merchants] = results;
                    res.locals.productCount   = products;
                    res.locals.merchantCount  = merchants;
                    res.render('site/index', { user : req.user });
                })
                .catch(next)

            }else{
                next()
            }
        }
    }
});
// Controller.use( function (req, res, next) {
//     if(req.user && req.user.deleted){
//         return res.redirect('/suspended');
//     }
//     next();
// });
Controller.get('/*', function (req, res, next) {
    // search
    res.render("site/search");
})

module.exports = Controller;