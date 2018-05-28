let mongoose    = require('mongoose');
let Schema      = mongoose.Schema;
let images      = require('./images.js');
let descriptors = require.main.require("./models/descriptors");
let Enums       = require.main.require("./models/enums");
let extend      = require('mongoose-schema-extend');
let slugify     = require("underscore.string/slugify");

mongoose.Promise = global.Promise;
let schema =  new Schema(descriptors.ServerSide.Products.Base ,{
    validateBeforeSave : true,
    timestamps         : true,
    collection         : "Products",
    // discriminatorKey : "_category",
});

schema.path('images').validate(function(images){
  var images = images.filter(function(image){ return image.deleted == false; });
  if(images && images.length <= 6) return true;
  else return false
}, "Only 6 images are allowed to be uploaded per product.", "images length");

var autoPopulateLead = function(next) {
  this.populate('owners');
  this.populate('brand');
  // this.valtid = "1234";
  next();
};

let booleans = function(next){
    if(this.get('images'))
        this.get('images').forEach((image, index)=>{
            if (image.deleted == "true")
                image.deleted = true;
            else
                image.deleted = false;
        });
    next();
}

schema
  .pre('findOne', autoPopulateLead)
  .pre('find', autoPopulateLead)
  .pre('save', booleans)
  ;
schema.virtual("primaryImage").get(function(){
    return (this.images || [])[0];
})

schema.method("enum", function(str){
    return this.schema.path(str).enumValues;
})
schema.virtual("slug").get(function(){
    if( ! this.createdAt ) this.createdAt = new Date();
    let mm = ('0' + (this.createdAt.getMonth()+1)).slice(-2) ;
    let YY = this.createdAt.getFullYear();
    return `products/${YY}/${mm}/${slugify(this.title)}/${this.id}`
})

let Products     = mongoose.model('Products', schema);

var out = {
    Base: Products
}

Enums.Products.categories.forEach((item, index) =>{
    let category = item.key;
    let descriptor = descriptors.ServerSide.Products[category];

    if(descriptor) out[category] = Products.discriminator(category, new Schema(descriptor) )
    else throw new Error(`Descriptor for "${category}" is not available.`);

})
// let Clocks        = Products.discriminator('Clocks', new Schema(descriptors.ServerSide.Products.Clocks) )
// let PocketWatches = Products.discriminator('PocketWatches', new Schema(descriptors.ServerSide.Products.PocketWatches) )




module.exports = out;