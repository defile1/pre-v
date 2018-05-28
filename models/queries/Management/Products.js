let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models/index');

mongoose.Promise = global.Promise


let getAllRecentProducts = () => {
    return new Promise((resolve, reject) => {
        Collections
        .Schemas
        .Products
        .Base
        .find()
        .limit(10)
        .then( resolve )
        .catch( reject )
    })
}

let getAll = () => {
    return new Promise((resolve, reject) => {
        Collections
        .Schemas
        .Products
        .Base
        .find()
        .populate("brands")
        .then( resolve )
        .catch( reject )
    })
}

module.exports = {
    getAllRecentProducts,
    getAll,
}