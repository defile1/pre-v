
let applyDBFilters = (ownerID, object = {}) => {
    if(!ownerID) throw "helper arguments are missing."

    object.deleted = false
    object.owners = { $in: [ownerID] }

    return object
}

// this does not mean they are removed from database
// remove means filter out
// unless they are saved with .save() after filter
let removeDeleted = (object, prop) => {
    if(object[prop]) object[prop] = object[prop].filter((item)=>{
        return item.deleted === false
    })
    return object
}

module.exports = {
    applyDBFilters,
    removeDeleted,
}