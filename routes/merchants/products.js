let express     = require('express');
let Controller  = express.Router();
let fs          = require('fs-extra');
let Helpers     = require.main.require('./helpers/index');
let Collections = require.main.require('./models/index');
let S           =  require("string");
var mongoose    = require('mongoose');

Controller.use(function(req, res, next){
    res.locals.Stores.Descriptors.Products = Collections.Descriptors.BrowserSide.Products
    res.locals.Stores.Descriptors.Brands   = Collections.Descriptors.BrowserSide.Brands
    next();
})

Controller
.get('/search/', function(req, res, next){
    let category = S(`-${req.params.category}`).camelize().s;
    let human    = S(category).humanize().s;
    let options  = {}

    if(req.query.search){
       var query = {$text: {$search: req.query.search, $language: 'en'}};

    }

    options.deleted   = false;
    // options._category = category;
    options.owners    = {$in: [req.user.id]};
    console.log(options);
    Collections.Schemas.Products.Base.find(options)
    .then((results)=>{
        res.locals.title         = "Manage products";
        res.locals.searchQuery   = req.query.search;
        res.locals.Stores.Data.Products = {schemaName: "Products", data: results};
        res.render('./merchants/products')
    })
    .catch(next)
})
.get('/:category/new/', function(req, res, next){
    let category = S(`-${req.params.category}`).camelize().s;
    let human = S(category).humanize().s;

    let doc = new Collections.Schemas.Products[category]({category:human},{strict: false});
    doc.owners.addToSet(req.user.id);
    doc.save({ validateBeforeSave: false })
    .then((results)=>{
        res.redirect(`/merchants/products/${category}/${results._id}/`);
    })
    .catch(next)
})
.get('/:category/', function(req, res, next){
    let category = S(`-${req.params.category}`).camelize().s;
    let human = S(category).humanize().s;
    let options = {}

    options.deleted  = false;
    options.category = human;
    options.owners   = {$in: [req.user.id]};

    Collections.Schemas.Products.Base
    .find(options)
    .then((results)=>{
        res.locals.title         = "Manage products";
        res.locals.Stores.Data.Products = {schemaName: "Products", data: results};
        res.render('./merchants/products')
    })
    .catch(next)
})
.get('/:category/:id/', function(req, res, next){
    let category = S(`-${req.params.category}`).camelize().s;
    let human    = S(category).humanize().s;
    let slug     = S(human).slugify().s;
    let options  = {}

    options._id        = req.params.id;
    options.deleted   = false;
    // options.category = human;

    options.owners    = {$in: [req.user.id]};
    if(res.locals.isCategory(human) === false){ return next("Product category is incorrect");}

    Promise
    .all([
        Collections.Schemas.Products.Base.findOne(options),
        Collections.Queries.Merchants.Products.getBrands()
    ])
    .then((results)=>{
        let [product, brands] = results
        if(product===null) return res.redirect(`/merchants/products/${slug}/`);
        if(product && product.images && product.images.length) product.images = (product.images).filter(function(image){ return image['deleted'] !== void 0 && (image.deleted===false) })
        // Helpers.removeDeleted(product, "images");
        // res.locals.Stores.Data.Products = {schemaName: "Products", data: [product]};
        res.locals.title   = `Manage ${product.category} products`;
        res.locals.product = product;
        res.locals.brands  = brands.map(item => item.toJSON() );

        res.locals.Stores.Data.Brands        = {schemaName: "Brands", data: brands }

        res.render('./merchants/product')
    })
    .catch(next)
})
.get('/', function(req, res, next){
    let options = {}

    options.deleted   = false;
    options.owners    = {$in: [req.user.id]};

    Collections.Schemas.Products.Base.find(options)
    .then(results => {
        res.locals.title         = "Manage products";
        res.locals.Stores.Data.Products = {schemaName: "Products", data: results};
        res.render('./merchants/products')
    })
    .catch(next)
})
.get('/:id', function(req,res,next){
    let productsID = req.params.id;
    let ownerID    = req.user.id;

    Promise
    .all([
        productsID == "new" ?
            new Collections.Schemas.Products :
            Collections.Queries.Merchants.Products.getProductById(productsID, ownerID),
            Collections.Queries.Merchants.Products.getBrands()
        ])
    .then((results) => {
        let [product, brands] = results

        if(product.images) product.images = (product.images).filter(function(image){ return image['deleted'] !== void 0 && (image.deleted===false) })

        Helpers.removeDeleted(product, "images");

        res.locals.enums        = Collections.Enums.Products
        res.locals.enums.brands = brands

        let outProduct  = product.toJSON();
        outProduct.slug = outProduct.slug;

        res.locals.Stores.Data.Products      = {schemaName: "Products", data: [outProduct]};
        res.locals.Stores.Data.Brands        = {schemaName: "Brands", data: brands.map(item => item.toJSON() ) }
        res.locals.product        = product;

        res.locals.title          = "Products";
        res.locals.isNew = (productsID == "new")

        res.render('./merchants/product');
    })
    .catch(next)
})
.get('/:category/:id/images', function(req,res,next){
    let productsID = req.params.id
    let ownerID    = req.user.id
    console.log("upload start:");

    Collections.Queries.Merchants.Products
    .getProductById(productsID, ownerID)
    .then(product=>{
        if(product && product.images && product.images.length) product.images = (product.images).filter(function(image){ return image['deleted'] !== void 0 && (image.deleted===false) });
        res.locals.product  = product;
        res.locals.products = product;
        res.render('./merchants/templates/products/images.njk')
    })
    .catch(next)
})
.put('/:category/:id/', function(req, res, next){//update
    let title      = "Updating a product";
    let category = S(`-${req.params.category}`).camelize().s;
    let human = S(category).humanize().s;

    let options = {};
    options._id      = req.params.id;
    options.owners   = {$in: [req.user.id]};
    // options.deleted  = false;
    // options.category = human;

    let body = req.body.product;
    let deleted = body.deleted;

    delete body.owners;
    delete body.deleted;
    delete body.roles;

    if(deleted === "true"){
        body.deleted = true;
    }

    Collections.Schemas.Products.Base
    .findOne(options)
    .populate('owners')
    .then((product)=>{
        if(!product) next("Product not found.");
        else{
            let doc = product;
            if(body.images) body.images = body.images.map(image => {
                image.deleted = (image.deleted).toString() === "true";
                return image;
            });
            // todo: fix image leak, of when deleted images on second refreshed page
            let saveOptions = {};
            if( body.deleted ){
                saveOptions = { validateBeforeSave: false };
            }

            doc.set(body);
            doc.save(saveOptions)
            .then(result => {
                let success = true;
                let message = "Product was updated successfully";
                res.json({success, message})
            })
            .catch( errors => {
                console.error(errors);
                let dev        = {deverror: errors};
                let error      = "Failed to update product."
                let validation = errors.errors;
                let json       = {title, error, dev, validation, prefix:"product"}
                res.status(409).json(json);
            })

        }

    })
    .catch(next);
})
.put('/:category/:id/upload/', function(req, res, next){
    let productsID = req.params.id
    let ownerID = req.user.id
    console.log("upload start:");

    Collections.Queries.Merchants.Products
    .getProductById(productsID, ownerID)
    .then((results) => {
        console.log("Got product :", productsID, "from: ", ownerID);
        let file = req.files.file;
        let dir = `./public/images/products`;

        // if (!fs.existsSync(`${dir}/${ownerID}/`)){ fs.mkdirSync(`${dir}/${ownerID}`); }
        fs.ensureDir(`${dir}/${ownerID}/${productsID}/`, function (err) {
            if (err){
                console.error(err);
                return res.status(409).send(err);
            }
            console.log("user folder: ", `${dir}/${ownerID}`);
            console.log("product folder: ", `${dir}/${ownerID}/${productsID}`);

            dir = `./public/images/products/${ownerID}/${productsID}`;

            console.log("pre readFile: ", file.path);
            if(["image/jpeg","image/png"].includes(file.mimetype)===false){
                let error = "File type not allowed.";
                return res.status(409).send({error});
            }

            var mid = mongoose.Types.ObjectId();
            let newPath = `${dir}/${mid}-${file.name.replace(/(?![\.a-zA-Z0-9\-])./g,'')}`;

            console.log("upload: moving to: ",newPath);
            file.mv(newPath, function(err){
                if (err){
                    console.error(err);
                    return res.status(409).send(err);
                }

                let image      = {};
                image.src      = newPath.slice(1);
                image.alt      = ""
                image.deleted  = false;
                results.images = results.images || [];
                results.images.push(image);
                results.markModified("images");

                results.validate(error => {
                    if( error &&
                        error.errors &&
                        error.errors.images &&
                        error.errors.images.kind === "images length"
                    ){
                        console.error(error);
                        let message = error.errors.images.message
                        let validation = error.errors;
                        res.status(409).json({error:message, code: 2, validation, prefix:"product"})
                    }else{
                        results
                        .save({validateBeforeSave: false})
                        .then(() => {
                            let success = "success"
                            res.json({success});
                        })
                        .catch(error => {
                            console.error(error);
                            let message = error.message
                            let validation = error.errors;
                            res.status(409).json({error:message, code: 2, validation, prefix:"product"})
                        });
                    }
                })


            });
        });
    })
    .catch(error => {
        console.error(error);
        let message = error.message
        res.status(409).json({error:message})
    })
})

module.exports = Controller