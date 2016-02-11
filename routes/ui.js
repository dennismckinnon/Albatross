'use strict';

var fs = require('fs-extra');
var restify = require('restify');


function addRoutes(server){
	//Serve static files

	server.get('/', restify.serveStatic({
		directory: './public',
		file: 'index.html'
	}));

	server.get(/\/ui\/?.*/, restify.serveStatic({
		directory: './public',
		default: './public/index.html'
	}));
}

module.exports = {
	addRoutes: addRoutes
}