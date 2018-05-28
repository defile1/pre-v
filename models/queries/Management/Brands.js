let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models/index');
let Helpers     = require.main.require('./helpers/index');

mongoose.Promise = global.Promise


let getAllBrandsCount = () => {
    return new Promise((resolve, reject) => {
        Collections
        .Schemas
        .Brands
        .count()
        .then( resolve )
        .catch(reject)
    })
}
let getAll = () => {
    return new Promise((resolve, reject) => {
        Collections
        .Schemas
        .Brands
        .find()
        .sort("title")
        .then( results => {  resolve(results) })
        .catch(reject)
    })
}

let getBrandByID = (ID) => {
    return new Promise((resolve, reject) => {
        if (ID === "new"){
            resolve(new Collections.Schemas.Brands);
        }else{
            Collections.Schemas.Brands
            .find({ _id : ID })
            .sort("title")
            .then( results => {  resolve(results[0] || []) })
            .catch(reject);
        }
    })
}

let addBrand = (props) =>{
    return new Promise((resolve, reject)=>{
        var models = props.models;
        // delete props.models ;
        let doc = new Collections.Schemas.Brands(props);
        doc.save()
        .then(resolve)
        .catch(reject)

    })
}


let findBrandAndUpdate = function (finds, props){
    let brands = Collections.Schemas.Brands
    return brands.findOneAndUpdate.apply(brands, arguments);
}

let findBrandAndRemove = function (finds, props){
    let brands = Collections.Schemas.Brands
    return brands.findOneAndRemove.apply(brands, arguments);
}


module.exports = {
    getAll,
    getAllBrandsCount,
    getBrandByID,
    addBrand,
    findBrandAndUpdate,
    findBrandAndRemove,
}