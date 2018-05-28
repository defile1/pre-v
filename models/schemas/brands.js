let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let images      = require('./images.js');
let descriptors = require.main.require("./models/descriptors");

let schema =  new Schema(descriptors.ServerSide.Brands ,{
    validateBeforeSave : true,
    timestamps         : true,
    collection         : "Brands",
});

module.exports = mongoose.model('Brands', schema);