let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models/index');

mongoose.Promise = global.Promise


let getAllUsersCount = () => {
    return new Promise((resolve, reject) => {
        Collections
        .Schemas
        .Users
        .count()
        .then( results => {  resolve(results) })
        .catch(reject)
    })
}

module.exports = {
    getAllUsersCount,
}