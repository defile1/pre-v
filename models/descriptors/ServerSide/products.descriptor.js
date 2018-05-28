let Base  = require('./products/base.json');
let Enums = require.main.require("./models/enums");

var out = {
    Base
}

Enums.Products.categories.forEach((item, index) =>{
    let category   = item.key;
    let descriptor = require(`./products/${category.toLowerCase()}.json`);
    if(descriptor) out[category] = descriptor;
    else throw new Error(`Descriptor for "${category}" is not available.`);
});

module.exports = out