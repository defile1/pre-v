var
express     = require('express'),
Controller  = express.Router(),
Collections = require.main.require('./models/index'),
Queries     = Collections.Queries
;


Controller.get('/', function (req, res, next) {
    req.requireLogin()

    Queries
    .SiteWatches
    .getAll()
    .then((results) => {
        let expose = {}
        expose.watches = results
        expose.user = req.user
        // console.log(results[0].slug)
        res.render('site/search/search', expose );
    })
    .catch(next)
});


module.exports = Controller;