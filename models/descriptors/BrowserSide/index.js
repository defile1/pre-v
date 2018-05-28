var ServerSide = require("../ServerSide");
var BS = JSON.parse(JSON.stringify(ServerSide));
// delete BS.Products.owners[0].ref;
// delete BS.Products.extras.brand.ref;
// // BS.Products.owners[0].ref = "Stores.Schemas.Users.tree";
// delete BS.Offers.product.ref;
// delete BS.Offers.from.ref;
// delete BS.Offers.messages[0].from.ref;
// delete BS.Offers.to.ref;



module.exports = BS