let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;

let Users        = require("./users.descriptor.json");
let Notifications = require("./notifications.json");
let Products      = require("./products.descriptor.js");
let Brands        = require("./brands.json");
let Offers        = require("./offers.descriptor.json");

// let Watches = require('./products/watches.json');

// Products.images.required = false;
// Products.Watches = Watches;
Products.Base.images.type = "Array";
// Products.extras.brand.type = "Array";


Brands.models.type = "Array";

Offers.product.type          = Schema.Types.ObjectId;
Offers.from.type             = Schema.Types.ObjectId;
Offers.to.type               = Schema.Types.ObjectId;
Offers.messages[0].from.type = Schema.Types.ObjectId;
Offers.messages[0].updatedAt.default = Date.now

module.exports = {
    Notifications,
    Users,
    Products,
    Brands,
    Offers,
}