
let Resources = require("./_resources.json")
// let Schemas = require("Schemas")

let loadResource = function (resource, app) {
    let Descriptor = require(`../models/descriptors/ServerSide/${resource.name}`);
    let Schema     = require(`../resources/models`)(resource.name, Descriptor);
    let Queries    = require(`../resources/queries`)(resource.name, Schema);
    let dir        = `/resources/${resource.name.toLowerCase()}/`
    console.log(dir)
    app.use( dir,  require(`../resources/routers`)(resource.name, Schema) );
}


module.exports = function(app){
    for (var i = Resources.length - 1; i >= 0; i--) {
        let resource = Resources[i];
        loadResource(resource, app)
    }
}