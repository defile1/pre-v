let express     = require('express');
let Controller  = express.Router();
let Collections = require.main.require('./models/index');


Controller
.use(function(req, res, next){
    res.locals.Stores.Descriptors.Products = Collections.Descriptors.BrowserSide.Products;
    next();
})
.get('/', function(req, res, next){
    Collections.Queries.Management.Products
    .getAll()
    .then(results => {
        res.locals.Stores.Data.Products = {schemaName: "Products", data: results};
        res.render('./management/products');
    })
    .catch(next)
})
.get('/:id', function(req, res, next){



    Promise
    .all([
        Collections.Schemas.Products.Base.findOne({_id: req.params.id}),
        Collections.Queries.Merchants.Products.getBrands()
    ])
    .then((results)=>{
        let [product, brands] = results
        if(product===null) return next("Product not found");
        if(product && product.images && product.images.length) product.images = (product.images).filter(function(image){ return image['deleted'] !== void 0 && (image.deleted===false) })
        // Helpers.removeDeleted(product, "images");
        // res.locals.Stores.Data.Products = {schemaName: "Products", data: [product]};
        res.locals.title   = `Manage ${product.category} products`;
        res.locals.product = product;
        res.locals.brands  = brands.map(item => item.toJSON() );

        res.locals.Stores.Data.Brands        = {schemaName: "Brands", data: brands }
        res.locals.isFromAdmin = true;
        res.render('./merchants/product');
    })
    .catch(next);
})

;


module.exports = Controller