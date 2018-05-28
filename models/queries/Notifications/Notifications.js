let mongoose      = require('mongoose');
let Models        = require.main.require('./models');
let Notifications = Models.Schemas.Notifications

mongoose.Promise = global.Promise

let getAll = (sessionID) => {
    return new Promise((resolve, reject) => {
        let options = {}
        options.sessionID = sessionID;
        options.deleted = false;

        Notifications
        .find( options )
        .then( resolve )
        .catch( reject )
    })
}

let create = (sessionID, body) => {
    return new Promise((resolve, reject) => {
        let options = body
        options.sessionID = sessionID
        let notification = new Notifications(options);

        notification
        .save()
        .then( resolve )
        .catch( reject )
    })
}


let deleteById = (sessionID, NID) => {
    return new Promise((resolve, reject) => {
        if(!NID){
            reject("Notification id was not found.")
        }else{
            let options = {}
            options.sessionID = sessionID;
            options._id        = NID;
            options.deleted   = false;

            Notifications
            .update(options, {$set:{deleted: true}})
            .then( resolve )
            .catch( reject )
        }
    })
}

let deleteAll = (sessionID) => {
    return new Promise((resolve, reject) => {
        let options = {}
        options.sessionID = sessionID;
        options.deleted   = false;

        Notifications
        .updateMany(options, {$set:{deleted: true}})
        .then( resolve )
        .catch( reject )
    })
}

module.exports = {
    getAll,
    create,
    deleteById,
    deleteAll,
}