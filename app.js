/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var assert = require('assert');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: __dirname + '/public/uploads/' });
var path = require("path");
var async = require("async");

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

app.set("view engine", "html");
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// MONGO CONFIGURATION
	var mongo = process.env.VCAP_SERVICES;
	var port = process.env.PORT || 3030;
	var conn_str = "";
	if (mongo) {
	  var env = JSON.parse(mongo);
	  if (env['mongodb-2.4']) {
	    mongo = env['mongodb-2.4'][0]['credentials'];
	    if (mongo.url) {
	      conn_str = mongo.url;
	    } else {
	      console.log("No mongo found");
	    }  
	  } else {
	    conn_str = 'mongodb://localhost:27017';
	  }
	} else {
	  conn_str = 'mongodb://localhost:27017';
	}
	
	var MongoClient = require('mongodb').MongoClient;
	var db; 
	MongoClient.connect(conn_str, function(err, database) {
	  if(err) throw err;
	  db = database;
	  //db.collection("files").remove();
	}); 

// ---------------------

// parse application/x-www-form-urlencoded 
//app.use(bodyParser);
 
// parse application/json 
//app.use(bodyParser.json());

var items;

app.get("/getFiles",function(req,res){
	if (db && db !== "null" && db !== "undefined") {
		db.collection('files').find().toArray(function(err, doc) {
		    assert.equal(err, null);
		    if (doc != null) {
		    	res.json(doc);
		    }
	    });
   }
});

app.post('/upload_files',upload.single('file'), function(req, res,next) {
	if (db && db !== "null" && db !== "undefined") {
		var item = {};
		item.name = req.file.originalname;
		item.data = fs.readFileSync(req.file.path);
		item.type = req.file.mimetype;
		item.size = req.file.size;
		item.location = req.body.location;
		var cursor =db.collection('files');
		cursor.insert(item, function(err, result){
			assert.equal(err, null);
		});
		console.log("Upload completed!:  " + req.file.path);
		res.redirect('/home.html');
	}else{
		res.send("base de datos no encontrada");
	}
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

