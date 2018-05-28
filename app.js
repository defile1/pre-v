let http           = require('http');
let https          = require('https');
let fs             = require('fs');
let express        = require('express');
let app            = express();
let bodyParser     = require('body-parser');
let methodOverride = require('method-override');
let cookieParser   = require('cookie-parser');
let mongoose       = require('mongoose');
let port           = process.env.PORT || 3000;
let httpsPort      = 443;
let nunjucks       = require('./config/nunjucks.config')(app);
let fileUpload     = require('express-fileupload');

console.log('Potential port: ', port);

app.use(fileUpload());

let privateKey = "";
let certificate = "";
mongoose.Promise = global.Promise;

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ', err);
});





    privateKey  = fs.readFileSync('./cert/pre2000.com.key', 'utf8');
    certificate = fs.readFileSync('./cert/pre2000.com.crt', 'utf8');

let credentials = {key: privateKey, cert: certificate};

app.enable('strict routing');
app.set('view engine', 'njk');

app.use(require("./config/logger"))

let env = process.env.NODE_ENV || 'development';
app.use((req, res, next)=>{
    req.env = res.env = app.get('env');
    next();
})
console.log("Enviroment: ", env)
app.use(cookieParser("3ZSr1ID8UQ1E53"));

app.use(bodyParser.json());                         // pull information from html in POST
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));                // simulate DELETE and PUT


// app.use(express.static(__dirname + '/build'));
if (app.get('env') === 'development') {
    app.use("/public",express.static(__dirname + '/public'));
    app.use("/public/static/",express.static(__dirname + '/views'));
}

// to know whether the request was via http or https.
app.use (function (req, res, next) {
  console.log('secure: ', req.secure);
  if (req.secure) {
    // request was via https, so do no special handling
     next();
  } else {
    // request was via http, so redirect to https
    res.redirect('https://' + req.headers.host + req.url);
  }
});

//if (app.get('env') === 'production') {
//    mongoose.connect('mongodb://vpsssdvc3274640T73:Ttz63UiBMTs11mxBcK@127.0.0.1/aw');
//}else{
   mongoose.connect('mongodb://defile:abc123@ds163119.mlab.com:63119/heroku_g8nnj4n1');
//}
let passport       = require('./config/passport')(app);

// app.use('/api', api);

// checks to be sure users are authenticated
app.use(function(req, res, next){
    if(req.query.debug){
        res.locals.debug = true;
    }
    console.info(req.url);
    req.requireLogin = () => {
        if (!req.user && !req.path.startsWith('/account')){
            let url = '/account/login/';

            if( req.header('accept').includes("application/json") ){
                res.status(401).json({redirect: url, error: "Please login and then continue as normal."});
            }else{
                res.redirect(url);
                res.end()
            }
        }
    }

    next();
});

app.use(function(req, res, next){
    req.roles = function(role){
        let user = this.user;
        return user && user.roles && user.roles.indexOf(`mm${role}`) !== -1;
    }
    console.log("set user roles function");
    next();
});

// load up our routes

// require("./resources")(app);

require(__dirname+'/routes/_autoload')(app);

app.use(function(err, req, res, next) {
    console.log("last Chance");
    console.log(err);
    next(err);
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render(__dirname+'/views/404', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.render(__dirname+'/views/error', {
        message: err.message,
        error: {}
    });
});



let httpServer = http.createServer(app);
let serverListenCB = function() {
    var os = require("os");
    var hostname = os.hostname();
console.log("Listening on: ", port )
  console.log("Listening on port %d", this.address().port,this.address(), hostname);
}

    let httpsServer = https.createServer(credentials, app);
    httpsServer.listen(port,serverListenCB);

//    httpServer.listen(80,function(req, res){ console.log('http server request should redirect.')   });  

