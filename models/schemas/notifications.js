
let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let descriptors = require.main.require("./models/descriptors");

var schema =  new Schema( descriptors.ServerSide.Notifications ,{
    validateBeforeSave: true,
    timestamps: true,
    collection         : "Notifications",
});

module.exports = mongoose.model('Notifications', schema);