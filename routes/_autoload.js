

// routes/index.js
var
_         = require('underscore'),
fs        = require('fs'),
excluded  = ['_autoload']
;



module.exports = function(app) {
    var loadFiles = function(directory){
        let list = fs.readdirSync(`${__dirname}${directory}`);
        list.forEach(function(file, index){
            if(file == "index.js"){
                list.splice(index, 1);
            }
        });
        list.unshift("index.js");
        list.forEach(function(file) {
            // Remove extension from file name
            var base     = file.split('.js')[0];
            var basename = `${directory}${base}`
            var basefile = `${directory}${file}`

            // Only load files that aren't directories and aren't blacklisted
            if(_.include(excluded, base)) return false;

            var full = `${__dirname}/${basefile}`
            if (!fs.lstatSync(full).isDirectory()) {
                let dir = basename.split('/index')[0] + "/"

                // we dan't want to show `/site/` on urls
                dir = dir.replace("/site/","/")
                console.log(dir, (`.${basefile}`));
                app.use(dir, require(`.${basefile}`));
                app.use(dir, function(err, req, res, next){
                    let section = "";
                    try{
                        section = dir.split("/")[1]|| "";
                    }catch(e){}
                    if(err && section.length){
                        res.locals.error = err;

                        let view        = `${section}/404`;
                        let curr        = fs.existsSync(`${view}.njk`) && view;
                        let parent      = curr || fs.existsSync(`${directory}404.njk`) && `${directory}404`;
                        let defaultView = parent || fs.existsSync(`views/404.njk`) && '404';

                        res.status(404).render(defaultView);
                    }else{
                        next();
                    }
                })
            }else{
                loadFiles(`${basename}/`)
            }
        });
    }
    var app = app
    app.use(function(req, res, next){
        res.locals.env = app.get("env");
        next();
    });
    loadFiles("/")

};
