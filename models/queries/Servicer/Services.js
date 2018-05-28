let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models');
let Helpers     = require.main.require('./helpers');
let Services    = Collections.Schemas.servicer.Base

mongoose.Promise = global.Promise

let removeDeletedImages = (results) => {
    return results.filter((result) => {
        if(result.images) result.images = result.images.filter((image) => {
            return image.deleted == false
        })
        return result
    })
}

let getServiceBySlug = (serviceID, title) => {
    return new Promise((resolve, reject) => {
        let options     = {}
        options.deleted = false;
        options.title   = new RegExp(`^${title}$`, 'i');
        options._id     = serviceID;
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

        Services
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

let getServiceById = (serviceID, ownerID) =>{
    return new Promise((resolve, reject) =>{
         if(!serviceID || !ownerID) throw "Id or owner id is not defined"

        let options = {}
        options._id = serviceID;
        options.owners = {$in: [ownerID]};
        options.deleted = false;

        Products
        .find( options )
        .then(results =>{
            if (results[0] == void 0){
                reject("This Product/service does not exist.")
            }  else{
                resolve( results[0] )
            }
        })
        .catch(reject)
    })
}


let updateOrCreateServiceById = (serviceID, ownerID, body) =>{
    return new Promise((resolve, reject) =>{
        if(!serviceID || !ownerID) throw "Id or owner id is not defined"
        if(serviceID == "new"){
            let doc = getNewService(body);
            doc.owners.addToSet(ownerID);
            doc
            .save()
            .then( resolve )
            .catch( reject )
        }else{
            getServiceById(serviceID, ownerID)
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


let getServiceImageById = (serviceID, imageID, ownerID) => {
    return new Promise((resolve, reject)=>{
        if(!serviceID || !imageID || !ownerID) reject("missing arguments")

        getServiceById(serviceID, ownerID)
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

let getNewService = (body={}) => new Service(body)

let addService = (props) =>{
    return new Promise((resolve, reject)=>{
        let superDoc = new Services(props);


        superDoc.save()
        .then(resolve)
        .catch(reject)
    })
}
let searchServices = (term) =>{
    return new Promise((resolve, reject)=>{
        Services
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
    return Services.findOneAndUpdate.apply(Services, [finds, props, {upsert: true}]);
}

module.exports = {
    findOneAndUpdate,
    getServiceById,
    getServiceImageById,
    updateOrCreateServiceById,
    getAll,
    getBrands,
    getServiceBySlug,
    searchServices,
    getAllRecent,
    getAllCount,
    getNewService,
    addService,
}