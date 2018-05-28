let Base  = require('./servicer/base.json');
let Enums = require.main.require("./models/enums");

var out = {
    Base
}

Enums.Servicer.categories.forEach((item, index) =>{
    let category   = item.key;
    let descriptor = require(`./servicer/${category.toLowerCase()}.json`);
    if(descriptor) out[category] = descriptor;
    else throw new Error(`Descriptor for "${category}" is not available.`);
});

module.exports = out