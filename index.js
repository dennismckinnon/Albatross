var server = require('./core/server');

console.log("Starting up!")

server.start(function(err){
	if (err) throw err;
})