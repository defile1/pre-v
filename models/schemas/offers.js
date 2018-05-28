let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let images      = require('./images.js');
let descriptors = require.main.require("./models/descriptors");

let schema =  new Schema(descriptors.ServerSide.Offers ,{
    validateBeforeSave : true,
    timestamps         : true,
    collection         : "Offers",
});

module.exports = mongoose.model('Offers', schema);