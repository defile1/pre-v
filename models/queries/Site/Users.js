let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models/index');
let Helpers     = require.main.require('./helpers/index');

mongoose.Promise = global.Promise


let getUsers = (UserID) => {
    return new Promise((resolve, reject) => {
        Collections
        .Schemas
        .Users
        .find({deleted: {$in: [false, null]}, _id: {$in: UserID }})
        .then( results => {  resolve(results) })
        .catch(reject)
    })
}


module.exports = {
    getUsers
}