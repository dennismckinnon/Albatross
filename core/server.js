var restify = require('restify');
//var restifyjwt = require('restify-jwt');
//var auth = require('../modules/auth');
var cfg = require('./config');

var name = "The Albatross Server";

restify.CORS.ALLOW_HEADERS.push('authorization')

var noauth = [
	'/',
	'/login',
	'/status'
]

function start(cb){

	var server = restify.createServer();
	server.use(restify.queryParser());
	server.use(restify.bodyParser({mapParams: true, mapFiles: true}));

	server.use(restify.CORS());

//	server.use(restifyjwt({secret: cfg.security.tokenSecret, getToken: auth.fromHeader, processPayload: auth.tokenParser}).unless({method:['OPTIONS'], path: noauth}))

//	require('../routes/ui').addRoutes(server);
	require('../routes/routes').addRoutes(server);

	server.listen(cfg.server.port);

	console.log("");
	console.log("Welcome to: " + name + ".");
	console.log("");
	return cb(null)
}

module.exports = {
	start: start
}
