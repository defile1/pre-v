var mongoose              = require('mongoose');
// var Date                  = require('datejs');
var Schema                = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var descriptors           = require.main.require("./models/descriptors");

var schema =  new Schema( descriptors.ServerSide.Users ,{
    validateBeforeSave : false,
    timestamps         : true,
    collection         : "Users",
});


schema.path('email').validate(function (email) {
    var emailRegex = /^[^@]+@[^@]+$/g;
    return email && emailRegex.test(email);
},'Email is invalid.',"email");

schema.pre("save",function(next) {
    if (this.roles.length == 0)
        this.roles.push("mmUser");

    next();
});


schema.virtual('isFacebook')
.get(function(){
    return this.facebook.toString().length > 2;
});

schema.virtual('isMerchant')
.get(function(){
    return (this.deleted !== true && this.roles||[]).includes('mmMerchant');
});

schema.virtual('isAdmin')
.get(function(){
    return (this.deleted !== true && this.roles||[]).includes('mmAdmin');
});

schema.virtual('isCollector')
.get(function(){
    return (this.deleted !== true && this.roles||[]).includes('mmCollector');
});

schema.virtual('isServicer')
.get(function(){
    return (this.deleted !== true && this.roles||[]).includes('mmServicer');
});


schema.virtual('isValidMerchant')
.get( function(){
    return this.validateSync() === void 0;
})

schema.virtual('isValidCollector')
.get( function(){
    return this.validateSync() === void 0;
})

schema.virtual('isValidServicer')
.get( function(){
    return this.validateSync() === void 0;
})

schema.virtual('isOpen')
.get(function(){
    if(!this.isMerchant) return false;
    if(!this.isValidMerchant) return false;

    let week = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    let today = new Date();
    let h     = today.getHours()+1;
    let m     = today.getMinutes()+1;
    let d     = week[today.getDay()];

    let isClosed;

    isClosed = this.companies.opening[d].from.toString().toLowerCase() == "closed";
    if(isClosed) return false;

    isClosed = this.companies.opening[d].to.toString().toLowerCase() == "closed";
    if(isClosed) return false;

    let from = new Date();
    let ff = this.companies.opening[d].from.split(":");
    let fh = new Number(ff[0]);
    let fm = new Number(ff[1]);

    from.setHours(fh);
    from.setMinutes(fm);

    let to = new Date();
    let tf = this.companies.opening[d].to.split(":");
    let th = new Number(tf[0]);
    let tm = new Number(tf[1]);

    to.setHours(th);
    to.setMinutes(tm);

    if(today>from && today<to) return true;

    return false;
})

schema.virtual('persons.name.full')
.get(function () {
    let name = this.persons.name;
    return name.first + (name.other?(' ' + name.other):'') + ' ' + name.last;
})
.set(function (name) {
    var split       = name.split(' ');
    this.persons.name.first = split[0];
    this.persons.name.last  = split[split.length-1];
    this.persons.name.other = split.slice(1, split.length-1).join(" ")
})
;
schema.plugin(passportLocalMongoose);

module.exports = mongoose.model( 'Users', schema );