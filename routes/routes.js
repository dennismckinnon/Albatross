//var auth = require('../modules/auth.js');
//var fs = require('fs-extra');
//var async = require('async');
//var cfg = require('../core/config');
var draw = require('../modules/draw');
var mysql = require('../modules/mysql');

module.exports = {
    addRoutes: addRoutes,
}

function addRoutes(server) {
//    server.post({url:'/login'}, loginRoute);
//    server.get('/settings', settingsRoute);
//    server.get('/status', statusRoute);
    server.get({url:'/hello'}, helloRoute_get);
    server.post('/hello', helloRoute_post);
    server.get('/draw', getimage_get);
    server.get('/check', checkTicket);
    server.post('/redeem/:id', redeem_post);
}

//These are for testing purposes ONLY 
// GET /hello
var helloRoute_get =function(req, res, next) {
    res.send("Hello!");
    return next();
};

var helloRoute_post =function(req, res, next) {
    res.send("Hello!!!")
    return next();
};

var getimage_get = function(req, res, next) {
    draw(20,  "Bogus Corp", function(err, tickets){
        if (err) {
            res.send(400,  "Something went wrong" + err);
            return next();
        } else {
            res.setHeader('Content-Type', 'application/pdf');
            res.send(tickets.toBuffer());
            return next()
        }

    })
            
}

var checkTicket = function(req, res, next) {
    mysql.checkValid(req.params.id, function(err, result){
        if (err) {
            res.send(err)
            return next()
        }

        res.send(result)
        return next()
    })
}

var redeem_post = function(req, res, next){
    mysql.redeemTicket(req.params.id, function(err, result){
        console.log(err)
        if (err) {
            res.send(result, err)
            return next()
        }

        res.send('Success')
        return next()

    })
}
