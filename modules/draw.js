var ioBarcode = require("io-barcode");
var Canvas = require("canvas");
var Image = Canvas.Image;

var moment = require('moment');
var async = require('async');

var mysql = require('./mysql');
var verifi = require('./verification');
var cfg = require("../core/config");


function drawBarcode(instr){
	var canvas = ioBarcode.CODE128B(instr, {
		width: 1,
		height: 25,
		fontSize: 8,
		displayValue: true
	})

	return canvas
}

function drawTicket(ctx, ID, code, compname, date, xpos, ypos){
	ctx.fillStyle = cfg.ticket.background
	ctx.fillRect(xpos, ypos, xpos + cfg.ticket.width,  ypos + cfg.ticket.height)
	ctx.fillStyle = 'black'

	//Construct rest of ticket 
	//Name
	ctx.font = cfg.ticket.namefont
	ctx.fillText(cfg.ticket.name, xpos + cfg.ticket.namexoff, ypos + cfg.ticket.nameyoff)

	//Address
	ctx.font = cfg.ticket.addrfont
	ctx.fillText(cfg.ticket.address, xpos + cfg.ticket.addrxoff, ypos + cfg.ticket.addryoff)

	//Date issued
	datestr = "Date Issued: " + date
	ctx.font = cfg.ticket.datefont
	ctx.fillText(datestr, xpos + cfg.ticket.datexoff, ypos + cfg.ticket.dateyoff)

	//Company
	compstr = "Company: " + compname
	ctx.font = cfg.ticket.compfont
	ctx.fillText(compstr, xpos + cfg.ticket.compxoff, ypos + cfg.ticket.compyoff)

	//ID
	idstr = "ID: " + ID
	ctx.font = cfg.ticket.idfont
	ctx.fillText(idstr, xpos + cfg.ticket.idxoff, ypos + cfg.ticket.idyoff)

	//Date Redeemed
	dredstr = "Date Redeemed: ___________________" //TODO configure length of line
	ctx.font = cfg.ticket.dredfont
	ctx.fillText(dredstr, xpos + cfg.ticket.dredxoff, ypos + cfg.ticket.dredyoff)

	//Barcode
	barcode = drawBarcode(code)
	bimg = new Image
	bimg.src = barcode.toBuffer()
	ctx.drawImage(bimg, xpos + cfg.ticket.bcodexoff, ypos + cfg.ticket.bcodeyoff)

}

function makeTickets(N, IDs, codes, compname){
	//Need to get Date
	date = moment().format('ll')

	var canvas = new Canvas(cfg.page.width, cfg.page.height, 'pdf');
	ctx = canvas.getContext('2d');

	count = 0
	while (count < N){
		//As long as we have more to print repeat this process

		//FIll page
		xpos = 0;

		while (xpos + cfg.ticket.width < cfg.page.width){
			ypos = 0;
			while(ypos + cfg.ticket.height < cfg.page.height){
				//Draw ticket
				drawTicket(ctx, IDs[count], codes[count], compname, date, xpos, ypos)
				count = count + 1
				ypos = ypos + cfg.ticket.height
			}
			xpos = xpos + cfg.ticket.width
		}

		//Draw lines on top
		ctx.strokeStyle = '#000000';
		ctx.linewidth = cfg.ticket.borderwidth
		ctx.beginPath()

		xpos = 0;
		while (xpos + cfg.ticket.width < cfg.page.width){
			ypos = 0;
			while(ypos + cfg.ticket.height < cfg.page.height){
				//Draw 2 lines
				//Line 1 at xpos from 0 to page.height
				ctx.moveTo(xpos, 0)
				ctx.lineTo(xpos, cfg.page.height)
				//Line 2 at ypos from 0 to page.width
				ctx.moveTo(0, ypos)
				ctx.lineTo(cfg.page.width, ypos)

				ypos = ypos + cfg.ticket.height
			}
			xpos = xpos + cfg.ticket.width
		}

		ctx.moveTo(xpos, 0)
		ctx.lineTo(xpos, cfg.page.height)
		ctx.moveTo(0, ypos)
		ctx.lineTo(cfg.page.width, ypos)

		ctx.stroke();

		ctx.addPage()
	}


	return canvas
}



module.exports = {
	makeTickets: makeTickets
}