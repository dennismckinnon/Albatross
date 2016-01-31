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
		return cb(null, {code: 200, message: "Ticket created with id: " + result.insertId.toString(), data: result.insertId.toString()}, result.insertId.toString())
	})
}

function redeemTicket(IDString, cb) {
	date = moment().format('YYYY-MM-DD');

	getTicketInfo(IDString, function(err, result, retval){
		if (err) return cb(err, null);

		if (result.code != 200) return cb(null, result); 

		if (!(result.valid === 1)) {
			return cb(null, {code:400, message:"No record of Ticket. Ticket invalid and possible forgery. Contact administrator and report, may indicate security breach"})
		}

		if (result.redeemed) {
			return cb(null, {code:400, message:"Ticket has already been redeemed"})
		}

		connection.query("update tickets set redeemdate=?, redeemed=true where ID=?",[date, IDString], function(err, results){
			if (err) return cb(err, null);
			return cb(null, {code: 200, message:"The Ticket was successfully redeemed!"})
		})
	})
}


// Database Reading information

function checkValid(IDString, cb) {
	//returns true if valid
	connection.query('Select * from tickets where ID = ?', [IDString], function(err, results, fields){
		if (err) return cb(err, null);

		if (results.length == 0) return cb(null, {code: 200, message: "Ticket is not valid", data: false});

		return cb(null, {code: 200,  message: "Ticket is " + (results[0].valid==1 ? "valid" : "not valid"), data: (results[0].valid == 1)}, (results[0].valid == 1))
	})
}

function checkRedeemed(IDString, cb){
	//returns true is redeemed
	connection.query('Select * from tickets where ID = ?', [IDString], function(err, results, fields){
		if (err) return cb(err, null, null);

		if (results.length == 0) return cb(null, {code: 400, message: "Ticket does not exist", data: null}, null);

		return cb(null, {code: 200, message: "Ticket " + (results[0].redeemed==1 ? "been " : "not been ") + "redeemed", data: (results[0].redeemed == 1)},  (results[0].redeemed == 1))
	})
}

function getTicketInfo(IDString, cb){
	//Return all ticket info
	console.log(IDString)
	connection.query('Select * from tickets where ID = ?', [IDString], function(err, results, fields){
		console.log(results)
		if (err) return cb(err, null);

		if (results.length == 0) return cb(null, {code: 400, message: "Ticket does not exist", data: null}, null);

		return cb(null, {code: 200, message: "Ticket found", data: results[0]},  results[0])
	})
}



module.exports = {
	createTicket: createTicket,
	redeemTicket: redeemTicket,
	checkValid: checkValid,
	checkRedeemed: checkRedeemed,
	getTicketInfo: getTicketInfo
}