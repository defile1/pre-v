let Collections = require.main.require('./models/index');
let express     = require('express');
let Controller  = express.Router();

Controller.use(function(req, res, next){
     // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/account/login/');
})

Controller.use(function(req, res, next){
    let isAdmin = req.user && req.user.isAdmin;

    if(!isAdmin) console.warn("isAdmin: ", isAdmin, req.user.id);
    console.log("isAdmin:",isAdmin);
    if(isAdmin){
        next();
    }else{
        res.redirect("/");
    }
})
Controller.get('/', function(req, res, next){
    Promise
    .all([
        Collections.Queries.Management.Products.getAll(),
        Collections.Queries.Management.Products.getAllRecentProducts(),
        Collections.Queries.Management.Users.getAllUsersCount(),
        Collections.Queries.Management.Brands.getAllBrandsCount(),
    ])
    .then(results => {
        let [all, products, users, brands] = results;

        res.locals.title                       = "Management";
        res.locals.AllUsers                    = users;
        res.locals.AllBrands                   = brands;
        res.locals.AllProducts                   = all;
        res.locals.Stores.Descriptors.Products = Collections.Descriptors.BrowserSide.Products
        res.locals.Stores.Data.Products        = {"schemaName": "Products", "data": products.map(item => item.toJSON() ) };

        res.render('management/index');
    })
    .catch(next);
});

// Controller.all('*',(req,res,next)=>{
    // res.render('management/404');
// })

module.exports = Controller
