let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models/index');
let Helpers     = require.main.require('./helpers/index');
let Products     = Collections.Schemas.Products.Base;

let removeDeletedImages = (results) => {
    return results.filter((result) => {
        // toJSON(result)
        if (result.images) result.images = result.images.filter((image) => {
            return image.deleted == false
        })
        return result
    })
}



let findByBrand = (title) => {
    return new Promise((resolve, reject) => {
        // getBrandByTitle(title)
        let filters = {}
        filters.deleted = false;
        filters.status = "published";

        Collections.Schemas.Products.Base
        .find(filters)
        .then( products =>{
            let out = [];
            products.forEach((product, index)=>{
                if(product && product.brand && product.brand.title.toLowerCase() === title.toLowerCase()){
                    out.push(product);
                }
            });

            resolve(out);
        })
        .catch(reject);

    })
}
let getBrandByTitle = (title) => {
    return new Promise((resolve, reject) => {
        let search = {$regex:title,$options: "i"};

        Collections.Schemas.Brands
        .find({ title: search })
        .then( resolve )
        .catch( reject )
    })
}
let getBrands = () => {
    return new Promise((resolve, reject) => {
        Collections.Schemas.Brands
        .find({})
        .sort("title")
        .then( resolve )
        .catch( reject )
    })
}

let getWatchById = (watchID) =>{
    return new Promise((resolve, reject) =>{
         if(!watchID ) throw "Id or owner id is not defined"

        let options = {}
        options._id = watchID;
        options.deleted = false;

        Products
        .find( options )
        .populate("owners")
        .then(results =>{
            if (results[0] == void 0){
                reject("This watch does not exist.")
            }  else{
                resolve( results[0] )
            }
        })
        .catch(reject)
    })
}

let getWatchBySlug = (watchID, title) => {
    return new Promise((resolve, reject) => {
        let options     = {}
        options.deleted = false;
        options.title   = new RegExp(`^${title}$`, 'i');
        options._id     = watchID;

        Products
        .find(options)
        .then( results => {
            results = removeDeletedImages(results);
            resolve(results.length?results[0]:results);
        })
        .catch(reject)
    })
}


let related = () => {
    return new Promise((resolve, reject) => {
        let options = {};
        options.deleted = false;
        options.status = "published";

        Collections.Schemas.Products.Base.find(options).limit(4)
        .then(resolve)
        .catch(reject)
        ;
    })
}

let count = () =>{
    return new Promise((resolve, reject) => {
        let ProductOptions = {};
        let UserOptions = {};

        ProductOptions.deleted = false;
        ProductOptions.status  = "published";
        UserOptions.roles     = {$in : ["mmMerchant"]};

        Promise
        .all([
            Collections.Schemas.Products.Base.count( ProductOptions ),
            Collections.Schemas.Users.count( UserOptions ),
        ])
        .then( results =>{
            let [totals, merchants] = results;
            resolve([totals, merchants])
        })
        .catch(reject)
    })
}

let filters = (options, page = 1, perPage = 15) => {
    return new Promise((resolve, reject) => {
        let skipper = (page * perPage) - perPage

        options.deleted = false;
        options.status = "published";

        var allProductsPriceLess = JSON.parse(JSON.stringify(options));
        delete allProductsPriceLess['prices.price'];
        Promise
        .all([
            Collections.Schemas.Products.Base.findOne( allProductsPriceLess ).populate("owners").sort("-prices.price"),
            Collections.Schemas.Products.Base.count( options ).populate("owners"),
            Collections.Schemas.Products.Base.findOne( options ).populate("owners").sort("-prices.price"),
            Collections.Schemas.Products.Base
                .find( options )
                .skip( skipper )
                .limit(perPage)
                .sort("-prices.price")
        ])
        .then( all  =>{
            let [prices, count, first, results] = all;
            resolve([results, {length: count, first}, prices, perPage]);
        })
        .catch( reject )
    })
}



module.exports = {
    filters,
    getBrands,
    findByBrand,
    getWatchById,
    getWatchBySlug,
    related,
    count,
}