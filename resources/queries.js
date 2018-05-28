
let getAll = (ownerID) => {
    return new Promise((resolve, reject) => {
        let options = {};
        options.deleted = false;
        options.to = ownerID;

        db
        .find( options )
        .then( results => {
            // results = removeDeletedImages(results);
            resolve(results)
        })
        .catch(reject)
    })
}

module.exports = function(db){
    return {
        getAll,
        // getByID,
        // create,
        // findOneAndUpdate,
    }
}