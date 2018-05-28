var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
let descriptors = require.main.require("./models/descriptors");
mongoose.Promise = global.Promise;

var schema =  new Schema( descriptors.ServerSide.Images, {
    validateBeforeSave : true,
    timestamps         : true,
    collection         : "Images",
});
var images = mongoose.model( 'Images', schema );
module.exports = images;