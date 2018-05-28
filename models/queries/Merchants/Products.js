let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models');
let Helpers     = require.main.require('./helpers');
let Products    = Collections.Schemas.Products.Base

mongoose.Promise = global.Promise

let removeDeletedImages = (results) => {
    return results.filter((result) => {
        if(result.images) result.images = result.images.filter((image) => {
            return image.deleted == false
        })
        return result
    })
}

let getProductBySlug = (productID, title) => {
    return new Promise((resolve, reject) => {
        let options     = {}
        options.deleted = false;
        options.title   = new RegExp(`^${title}$`, 'i');
        options._id     = productID;
        options.owners = {$in: [ownerID]};

        Products
        .find(options)
        .then( results => {
            results = removeDeletedImages(results);
            resolve(results.length?results[0]:results);
        })
        .catch(reject)
    })

}
let getAll = (ownerID) => {
    return new Promise((resolve, reject) => {
        let options = {}
        options.owners = {$in: [ownerID]};
        options.deleted = false;

        Products
        .find( options )
        .then( results => {
            results = removeDeletedImages(results);
            resolve(results)
        })
        .catch(reject)
    })
}

let getAllCount = (ownerID) => {
    return new Promise((resolve, reject) => {
        let options = {}
        options.owners = {$in: [ownerID]};
        options.deleted = false;

        Products
        .count( options )
        .then( resolve )
        .catch(reject)
    })
}
let getAllRecent = (ownerID) => {
    return new Promise((resolve, reject) => {
        let options = {}
        options.owners = {$in: [ownerID]};
        options.deleted = false;

        Products
        .find( options )
        .limit(4)
        .then( results => {
            results = removeDeletedImages(results);
            resolve(results)
        })
        .catch(reject)
    })
}


let getBrands = () => {
    return new Promise((resolve, reject) => {
        Collections.Schemas.Brands
        .find()
        .sort("title")
        .then( results => { resolve(results) })
        .catch(reject)
    })
}

let getProductById = (productID, ownerID) =>{
    return new Promise((resolve, reject) =>{
         if(!productID || !ownerID) throw "Id or owner id is not defined"

        let options = {}
        options._id = productID;
        options.owners = {$in: [ownerID]};
        options.deleted = false;

        Products
        .find( options )
        .then(results =>{
            if (results[0] == void 0){
                reject("This Product does not exist.")
            }  else{
                resolve( results[0] )
            }
        })
        .catch(reject)
    })
}


let updateOrCreateProductById = (productID, ownerID, body) =>{
    return new Promise((resolve, reject) =>{
        if(!productID || !ownerID) throw "Id or owner id is not defined"
        if(productID == "new"){
            let doc = getNewProduct(body);
            doc.owners.addToSet(ownerID);
            doc
            .save()
            .then( resolve )
            .catch( reject )
        }else{
            getProductById(productID, ownerID)
            .then( doc => {
                doc.owners.addToSet(ownerID);
                doc.set(body);
                doc
                .save()
                .then( resolve )
                .catch( reject )
            })
            .catch(reject)
        }
    })
}


let getProductImageById = (productID, imageID, ownerID) => {
    return new Promise((resolve, reject)=>{
        if(!productID || !imageID || !ownerID) reject("missing arguments")

        getProductById(productID, ownerID)
        .then((results)=>{
            // results = Product item
            let images = results.images
            let image = images.filter(function(image){ return imageID ==  image._id; })
            image = image[0] || [];
            if(image[0] && image[0].deleted === true) reject("Image deleted already.")
            else if(image) resolve([image, results])
            else reject("image not found")
        })
        .catch(reject)
    })
}

let getNewProduct = (body={}) => new Products(body)

let addProduct = (props) =>{
    return new Promise((resolve, reject)=>{
        let superDoc = new Products(props);


        superDoc.save()
        .then(resolve)
        .catch(reject)
    })
}
let searchProducts = (term) =>{
    return new Promise((resolve, reject)=>{
        Products
        .find({$or :
          [
            { title      : term },
            { description: term },
          ]
        })
        .then(resolve)
        .catch(reject)
    })
}
let findOneAndUpdate = function (finds, props){
    // props.markModified("images");
    return Products.findOneAndUpdate.apply(Products, [finds, props, {upsert: true}]);
}

module.exports = {
    findOneAndUpdate,
    getProductById,
    getProductImageById,
    updateOrCreateProductById,
    getAll,
    getBrands,
    getProductBySlug,
    searchProducts,
    getAllRecent,
    getAllCount,
    getNewProduct,
    addProduct,
}