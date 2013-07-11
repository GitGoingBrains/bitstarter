var express = require('express');
var fs = require('fs')
var app = express.createServer(express.logger());

var contentsBuffer = fs.readFileSync('index.html');
var buffer = new Buffer(contentsBuffer);
var contents = buffer.toString('utf-8');

app.get('/', function(request, response) {
  response.send(contents);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
