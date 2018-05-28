let express     = require('express');
let Controller  = express.Router();
let Collections = require.main.require('./models/index');
let fs          = require('fs-extra');



Controller
.use(function(req, res, next){
    res.locals.Stores.Descriptors.Brands = Collections.Descriptors.BrowserSide.Brands;
    next();
});

Controller.get('/', function(req, res, next){
    Collections.Queries.Management.Brands
    .getAll()
    .then(results => {
        res.locals.Stores.Data.Brands = res.locals.brands = {schemaName: "Brands", data: results};
        res.render('./management/brands');
    })
    .catch(next)
});

Controller.get('/:id', function(req, res, next){
    Collections.Queries.Management.Brands
    .getBrandByID(req.params.id)
    .then(results => {
        res.locals.Stores.Data.Brands = res.locals.brands = {schemaName: "Brands", data: [results]};
        res.locals.isNew              = req.params.id === "new";
        res.render('./management/brands/single-brand')
    })
    .catch(next)
});

Controller.post('/', function(req, res, next){//create
    var body    = req.body
    let title   = "Adding a new brand"

    Collections.Queries.Management.Brands
    .addBrand(body)
    .then(function (results) {

        let success = true
        let id      = results.id
        let message = "Brand added successfully."
        res.json({success, id, message, isNew : true})
    })
    .catch(function(errors){

        let dev   = {deverror: errors.errors, errors};
        let error = errors.errors;
        error.server = {message:"Failed to add new brand."}

        let json  = {title, error, dev}
        res.status(409).json(json);
    });
});

Controller.put('/:id', function(req, res, next){//update

    let body       = req.body;
    let title      = "Updating a brand"

    Collections.Queries.Management.Brands
    .findBrandAndUpdate({ _id: req.params.id }, {$set: body} )
    .then((result) => {
        let success = true;
        let id      = result.id;
        let message = "Brand saved successfully."
        res.json({success, id, message})
    })
    .catch((errors)=>{
        let dev   = {deverror: errors.errors};
        let error = "Failed to add new brand."
        let json  = {title, error, dev}
        res.status(409).json(json);
    })
});

Controller.delete('/:id', function(req, res){
    let title   = "Remove brand";

    Collections.Queries.Management.Brands
    .findBrandAndRemove({_id:req.params.id})
    .then((result) =>{
        let success = "Deleted brand successfully";
        let message = success;
        let json    = {title, success, message};
        res.json(json);
    })
    .catch(()=>{
        let error = "There was a problem.";
        let json = {title, error};
        res.status(409).json(json);
    })
});

Controller.put('/:id/upload/', function(req, res, next){
    let brandID = req.params.id
    console.log("brand upload start:");

    Collections.Queries.Management.Brands
    .getBrandByID(brandID)
    .then((results) => {
        if(!req.files){
            return res.status(409).json({error, code: 1});
        }

        let file = req.files.file;
        let dir = `./public/images/brands`;

        fs.ensureDir(dir, function (err) {
            if (err){
                return res.status(409).send(err);
            }

            console.log("brand folder: ", `${dir}/`);

            console.log("pre readFile: ", file.path);
            let newPath = `${dir}/${brandID}-${file.name}`;

            file.mv(newPath, function(err){
                if (err){
                    return res.status(409).send(err);
                }

                let image      = {};
                image.src      = newPath.slice(1);
                image.alt      = ""
                image.deleted  = false;
                results.image = image;
                results.markModified("image");

                results
                .save()
                .then(() => {
                    let success = "success"
                    res.json({success});
                })
                .catch(error => {
                    let message = error.message
                    res.status(409).json({error:message, code: 2})
                });
            });
        });
    })
    .catch(error => {
        let message = error.message
        res.status(409).json({error:message})
    })
})
;


module.exports = Controller