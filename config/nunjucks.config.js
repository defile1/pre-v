let nunjucks   = require('nunjucks');
let dateFilter = require('nunjucks-date-filter');
let S          = require('string');
let slugify    = require("underscore.string/slugify");

let init = function (app) {
    let appLocales = ['de', 'en', 'fr'];
    let enviroment = nunjucks.configure('views', {
        autoescape : true,
        express    : app,
        watch      : true,
        noCache    : true
    });


    enviroment.addFilter('FromEnum', function(key, file, path) {
        let walk = path.split(".");
        let result = this.ctx.Stores.Enums[file];

        for(item in walk){
            result = result[walk[item]];
        }

        result = result.filter((item,index)=>{ return item.key === key })

        if(result && result[0] && result[0].title) return result[0].title;

        return "";
    })
    enviroment.addFilter('FromBoolean', function(str) {
        return (str === true)? "Yes" : "No";
    })
    enviroment.addFilter('roles', function(user,  role) {
        return user.roles.indexOf(`mm${role}`) !== -1;
    })
    enviroment.addFilter('slug', function(str) {
        return slugify(str);
    })
    enviroment.addFilter('String', function(str, method) {
        let x = S(str);
        let args = Array.prototype.slice.call(arguments, 2);
        return x[method].apply(x, args).s
    })
    enviroment.addFilter('now', function() {
        return new Date();
    })
    enviroment.addFilter('debugger', function(results) {
        let context = this.ctx;
        debugger
    })
    enviroment.addFilter('defaultImage', function(image) {
        return image?image : Site.noPhoto;
    })
    enviroment.addFilter('active', function(url, str, exact) {
        if(exact) return url === str? "active": "";
        return url.includes(str)? "active": "";
    })
    enviroment.addFilter('toJSON', function(str) {
        return JSON.stringify( str );
    })

    enviroment.addFilter('pretty', function(str) {
        return JSON.stringify( JSON.parse(str), null, 4 );
    })
    enviroment.addFilter('NumberFormat', function(str) {
        return new Intl.NumberFormat("en-GB").format(str);
    })
    enviroment.addFilter('pre', function(str) { return "<pre>" + str + "</pre>" })

    dateFilter.install(enviroment);
}

module.exports = init