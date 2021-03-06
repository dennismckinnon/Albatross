//var auth = require('../modules/auth.js');
//var fs = require('fs-extra');
var async = require('async');
//var cfg = require('../core/config');
var draw = require('../modules/draw');
var mysql = require('../modules/mysql');
var verifi = require('../modules/verification');
var cfg = require('../core/config');
var auth = require('../modules/auth');

module.exports = {
    addRoutes: addRoutes,
}

function addRoutes(server) {
    server.post({url:'/login'}, loginRoute);
    server.post('/newuser', createUser);
//    server.get('/settings', settingsRoute);
//    server.get('/status', statusRoute);
    server.get({url:'/hello'}, helloRoute_get);
    server.post('/hello', helloRoute_post);
    server.post('/create', create_post);
    server.get('/info/:id', getTicket_get);
    server.post('/redeem', redeem_post);
    server.get('/draw', getimage_get);
}

//These are for testing purposes ONLY 
// GET /hello
// GET /hello
var helloRoute_get =function(req, res, next) {
    res.json(req.user);
    return next();
};

var helloRoute_post =function(req, res, next) {
    res.json(req.user);
    return next();
};

var getimage_get = function(req, res, next){
    N = 20
    compname = "Bogus Corp"

    IDs = []
    codes = []

    //Get ID's
    i = 0
    async.whilst(function(){return i<N},
        function(acb){
            i++;
            mysql.createTicket(compname, function(err, ID){
                if (err) return acb(err);

                IDs.push(ID)
                codes.push(verifi.HMACIFY(ID, cfg.security.secret))
                console.log('ID: ' + IDs[i-1] + " code: " + codes[i-1] + " verify? " + verifi.HMACVerify(codes[i-1], cfg.security.secret).toString())
                return acb(null)
            })

        },function(err){

            //TODO: Need to do error handling around this
            tickets = draw.makeTickets(N, IDs, codes, compname)

            if (err) {
                res.send(500,  err);
                return next();
            } else {
                res.setHeader('Content-Type', 'application/pdf');
                res.send(tickets.toBuffer());
                return next()
            }
        }
    )
}

var createUser = function(req, res, next){
    var passkey = auth.makeKey(req.body.password).toString('hex')
    user = {
        username: req.body.username,
        passhash: passkey,
        firstname: req.body.firstname,
        lastname:  req.body.lastname,
        email: req.body.email,
        isAdmin: req.body.isAdmin,
    }
    mysql.createUser(user, function(err, result){
        if (err) {
            res.send(500, err)
            return next()
        }

        res.json(result.code, result)
        return next()
    })
}

// Real stuff
var loginRoute = function(req, res, next) {
    var username = req.body.username
    mysql.findUsername(username, function(err, result,  data){
        if (err) {
            res.send(500, err)
            return next()
        }

        if (result.code != 200){
            res.send(401, {code: 401, message: result.message})
            return next()
        }

        var passkey = auth.makeKey(req.body.password).toString('hex')
        if (data.passhash != passkey) {
            res.json(401, {code: 401, message: "Incorrect Password"})
            return next()
        }

        var user = {username: data.username, isAdmin: data.isAdmin, firstname: data.firstname, lastname: data.lastname, uid: data.uid};
        var token = auth.makeToken(user)
        res.json({token: token});
        return next()

    });
};

var create_post = function(req, res, next){
    N = parseInt(req.params.number);
    compname = req.params.company;

    IDs = []
    codes = []

    //Get ID's
    i = 0
    async.whilst(function(){return i<N},
        function(acb){
            i++;
            mysql.createTicket(compname, function(err, ID){
                if (err) return acb(err);

                IDs.push(ID)
                codes.push(verifi.HMACIFY(ID, cfg.security.TicketSecret))
                console.log('ID: ' + IDs[i-1] + " code: " + codes[i-1] + " verify? " + verifi.HMACVerify(codes[i-1], cfg.security.secret).toString())
                return acb(null)
            })

        },function(err){

            //TODO: Need to do error handling around this
            tickets = draw.makeTickets(N, IDs, codes, compname)

            if (err) {
                res.send(500,  err);
                return next();
            } else {
                res.setHeader('Content-Type', 'application/pdf');
                res.send(tickets.toBuffer());
                return next()
            }
        }
    )
}

var redeem_post = function(req, res, next){
    //Insert verification
    ID = parseInt(req.params.idstr.split("-")[0])
    if (!verifi.HMACVerify(req.params.idstr, cfg.security.TicketSecret)){
        res.json(400, {code: 400, message: "The ticket failed to be validated. It might be a forgery or you might have entered the ID string incorrectly"})
        return next()
    }

    mysql.redeemTicket(ID, function(err, result){
        if (err) {
            res.send(500, "An Error occurred during the request: " + err)
            return next()
        }
        res.json(result.code, result)
        return next()
    })
}

var getTicket_get = function(req, res, next){
    mysql.getTicketInfo(req.params.id, function(err, result){
        if (err) {
            res.send(500, err)
            return next()
        }

        res.send(result.code, result)
        return next()
    })
}