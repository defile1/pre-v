let express    = require('express');
let Controller = express.Router();
let Models     = require.main.require('./models');


Controller.delete('/all/', function(req, res, next){
    let sessionID = req.sessionID;
    Models.Queries.Notifications.deleteAll(sessionID)
    .then((results) => {
        let success = true;
        res.json({success});
    })
    .catch(function(error){
        error = error.message;
        res.status(409).json({error});
    })
})
Controller.delete('/', function(req, res, next){
    let nid        = req.body.id;
    let sessionID = req.sessionID;

    Models.Queries.Notifications.deleteById(sessionID, nid)
    .then((results) => {
        let success = true;
        res.json({success});
    })
    .catch(function(error){
        error = error.message;
        res.status(409).json({error});
    })
})
Controller.post('/', function(req, res, next){
    let body      = req.body;
    let sessionID = req.sessionID;
    Models.Queries.Notifications.create(sessionID, body)
    .then((results) => {
        let success = true;
        res.json({success});
    })
    .catch(function(error){
        error = error.message;
        res.status(409).json({error});
    })
});


module.exports = Controller
