var mongoose   = require('mongoose')
	, Schema     = mongoose.Schema
  ;

var Person =  new Schema({
		title    : String,
		name       : {
			first: String,
			other: String,
			last : String,
		},
		email   : String,
		dob     : Date,
		add1    : String,
		add2    : String,
		add3    : String,
		add4    : String,
		add5    : String,
		postcode: String,
});

module.exports = mongoose.model('Person', Person);