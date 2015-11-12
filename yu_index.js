var express = require('express');
var request = require('superagent');
var parse = require('csv-parse');
//var fs = require('fs');
var app = express();

// Define global variables
var lat, lon, years;

var server = app.listen(3000, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});


app.get('/search', function(req1, res1){
	// GET variables lat, lon, start and end years
	res1.send("Parameters received, retriving data from Daymet");
	lat = req1.query.lat;
	lon = req1.query.lon;
	years = req1.query.year;

	var output = [];
	var text;
	var myresult = [];
	var req = request.get('https://daymet.ornl.gov/data/send/saveData?lat=43.1&lon=-85.3&year=2012').buffer().end(function(err, res){
		text = res.text;
		var parser = parse();

		parser.on('readable', function(){
  		while(record = parser.read()){
    		myresult.push(record);
  		}
		});
		// Catch any error
		parser.on('error', function(err){
	  		console.log(err.message);
		});

		parser.on('finish', function(){
			console.log(myresult);
		});

		output = text.split(/\r?\n/).slice(8, 20);
		for(i = 0; i < 5; i++){
			parser.write(output[i] +'\n');
		}
		parser.end()
	});
});
