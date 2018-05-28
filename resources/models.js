
module.exports = function(resource, descriptor){
    let mongoose    = require('mongoose');
    let Schema      = mongoose.Schema;
    let schema =  new Schema(descriptor ,{
        validateBeforeSave : true,
        timestamps         : true,
        collection         : resource,
    });

    return mongoose.model(resource, schema);
}