let express = require('express');
let app     = express();

module.exports.Schemas     = require('./schemas');
module.exports.Descriptors = require("./descriptors");
module.exports.Enums       = require('./enums');
module.exports.Queries     = require('./queries');
