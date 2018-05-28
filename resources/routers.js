let express     = require('express');
let Controller  = express.Router();

let init = function(resource, db){
    // get all items
    Controller.get('/', function(req, res, next){
        db
        .find({})
        .then(results => {
            res.json( results )
        })
        .catch(next)
    });
    Controller.get('/:id', function(req, res, next){
        db
        .find({ id : req.params.id })
        .then(results => {
            res.json( results )
        })
        .catch(next)
    })
    Controller.post('/:id', function(req, res, next){
        let id      = req.params.id === "new" ? null : req.params.id;
        let error   = "Not added";
        let success = "Success";
        let options = {
            upsert              : true,
            new                 : true,
            runValidators       : true,
            setDefaultsOnInsert : true,
        }

        db
        .findOneAndUpdate({id}, req.body, options)
        .then(function (model) {
            res.json({success, message: "successfully added", resource: model.toJSON()})
        })
        .catch(function (err) {
            res.json({error, message: err})
        })
        // db
        // .create()
    });

    return Controller;
}
module.exports = init
