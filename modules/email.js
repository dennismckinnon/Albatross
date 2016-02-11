var nodemailer = require('nodemailer');

var cfg = require('../core/config');

var transporter;
var from;

init()

module.exports = {
	init: init,
	send: sendConfirmation
}

function init(){
	// create reusable transporter object using SMTP transport
	from = cfg.server.service + " <" + cfg.email.auth.user + ">"
	transporter = nodemailer.createTransport(cfg.email);
}

function sendConfirmation(to, confirmpath, cb) {

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: from, // sender address
	    to: to, // list of receivers
	    subject: "Welcome to Albatross Tickets", // Subject line
	    text: "Welcome to Albatross Tickets! \n\n To prevent abuse we request that you use the following link to confirm your account\n\n" + confirmpath + "\nDidn't sign up for Albatross Tickets? No worries. You can safely ignore this email.", // plaintext body  --- TODO MAKE THIS BETTER
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        console.log(error);
	        cb(error)
	    }else{
	        console.log('Message sent: ' + info.response);
	        cb(null)
	    }
	});

}