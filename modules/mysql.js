var mysql = require('mysql');
var moment = require('moment');
var cfg = require('../core/config');

var connection = mysql.createConnection(cfg.mysql);

connection.connect();

//Here we get to write our accessing functions
function createTicket(compname, cb) {
	date = moment().format('YYYY-MM-DD')
	connection.query('INSERT INTO tickets SET ?', {company: compname, issuedate: date}, function(err, result){
		if (err) return cb(err, null);
		console.log(result.insertId);
		return cb(null, result.insertId.toString())
	})
}

function redeemTicket(IDString, cb) {
	date = moment().format('YYYY-MM-DD')
	//Need to check if ticket is valid return error if it isn't
	console.log("1")
	checkRedeemed(IDString, function(err, result){
		console.log("1a")
		console.log(err)
		console.log("1b")
		if (err) return cb(err, 500);
		console.log("2")

		if (result == null || result == true) return cb(new Error("The ticket could not be redeemed"), 400);
		console.log("3")

		connection.query("update tickets set redeemdate=?, redeemed=true where ID=?",[date, IDString], function(err, results){
			if (err) return cb(err, 500);
			console.log(results)
			return cb(null)

		})
	})

	return cb(null, null)
}

function checkValid(IDString, cb) {
	//returns true if valid
	connection.query('Select * from tickets where ID = ?', [IDString], function(err, results, fields){
		if (err) return cb(err, null);

		if (results.length == 0) return cb(null, false);

		return cb(null, (results[0].valid==1))
	})
}

function checkRedeemed(IDString, cb){
	console.log("6")
	//returns true is redeemed
	connection.query('Select * from tickets where ID = ?', [IDString], function(err, results, fields){
		console.log("7")
		if (err) return cb(err, null);
		console.log("8")

		if (results.length == 0) return cb(null, null);
		console.log("9")
		return cb(null, (results[0].redeemed==1))
	})
}

function getTicketInfo(IDString, cb){
	//Return all ticket info
	connection.query('Select * from tickets where ID = ?', [IDString], function(err, results, fields){
		if (err) return cb(err, null);

		if (results.length == 0) return cb(null, null);

		return cb(null, results[0])
	})
}

module.exports = {
	createTicket: createTicket,
	redeemTicket: redeemTicket,
	checkValid: checkValid,
	checkRedeemed: checkRedeemed,
	getTicketInfo: getTicketInfo
}