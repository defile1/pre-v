let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let Collections = require.main.require('./models');
let Helpers     = require.main.require('./helpers');
let Offers      = Collections.Schemas.Offers

mongoose.Promise = global.Promise

let create = () => {

    let obj = {
        product  : "5889fd4b87c83b37ec4b482d",
        from     : "5889fc854e326537688f6d5e",
        to       : "5889fc854e326537688f6d5e",
        messages : [{
            from    : "5889fc854e326537688f6d5e",
            message : "How much for this? is this your final price"
        },{
            from    : "5889fc854e326537688f6d5e",
            message : "You there mate ?"
        }],
        status  : "pending",
        deleted : "false"
    }
    let o = new Offers(obj);

    o.save();

    console.log("Added new offer");
}

let findOneAndUpdateMessage = (finds, props) => {
    return new Promise((resolve, reject) => {
        Offers
        .find( finds )
        .populate('from to product messages.from')
        .then( results => {
            if (results[0] == void 0){
                reject("This Product does not exist.")
            }  else{
                // resolve( results[0] )
                let messages = results[0].messages;
                // props.from = "5880dc76a1dda24b60ad6455"
                messages.addToSet(props);

                messages._parent
                .save()
                .then(resolve)
                .catch(reject)
            }
        })
        .catch(reject)
    })
}

let getOfferByID = (ID, ownerID) => {
    return new Promise((resolve, reject) => {
        let options     = {};
        options.deleted = false;
        options.to      = ownerID;
        options._id      = ID;

        Offers
        .find( options )
        .populate("product from to messages.from")
        .then( results => {
            if (results[0] == void 0){
                reject("This Product does not exist.")
            }  else{
                resolve( results[0] )
            }
        })
        // .catch(reject)
        .catch(function (event) {
            reject(event)
        })
    })
}
let getAllRecent = (ownerID) => {
    return new Promise((resolve, reject) => {
        let options = {}
        options.to = ownerID;
        options.deleted = false;

        Offers
        .find( options )
        .populate("product from to messages.from")
        .limit(4)
        .then( results => {
            resolve(results)
        })
        .catch(reject)
    })
}
let getAll = (ownerID) => {
    return new Promise((resolve, reject) => {
        let options = {};
        options.deleted = false;
        options.to = ownerID;

        Offers
        .find( options )
        .populate("product from to messages.from")
        .then( resolve )
        .catch( reject )
    })
}

let getAllCount = (ownerID) => {
    return new Promise((resolve, reject) => {
        let options = {};
        options.deleted = false;
        options.to = ownerID;

        Offers
        .count( options )
        .then( resolve )
        .catch( reject )
    })
}

module.exports = {
    getAll,
    getAllRecent,
    getAllCount,
    getOfferByID,
    create,
    findOneAndUpdateMessage,
}