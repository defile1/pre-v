let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models/index');
let Helpers     = require.main.require('./helpers/index');

mongoose.Promise = global.Promise

let updateCurrentUser = function (id, body){
    return new Promise((resolve, reject) =>{
        Collections.Schemas.Users
        .findOneAndUpdate({ _id: id}, body,{new:true} )
        .then(resolve)
        .catch(reject)
    })
}

let getByID = (ID) =>{
    return new Promise((resolve, reject) =>{
        if(!ID) throw "Id or owner id is not defined"

        let options = {}
        options._id = ID

        Collections.Schemas.Users
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

module.exports = {
    updateCurrentUser,
    getByID,
}