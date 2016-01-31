
var crypto = require('crypto');

function packCheck(ID, check){
	//Outputs packed checkstring
	packed = ID + "-" + check
	return packed
}

function unpackCheck(checkstr){
	unpacked = checkstr.split("-")
	return unpacked
}

function runHMAC(data, secret){
	HMAC = crypto.createHmac('sha1', secret)
	HMAC.update(data)
	return HMAC.digest('base64').slice(0,10);
}

function HMACIFY(ID, secret){
	digest = runHMAC(ID, secret)
	return packCheck(ID, digest);
}

function HMACVerify(datastr, secret){
	data = unpackCheck(datastr)
	digest = runHMAC(data[0], secret)

	if (digest == data[1]){
		return true
	} else {
		return false
	}
}

module.exports = {
	packCheck: packCheck,
	unpackCheck: unpackCheck,
	runHMAC: runHMAC,
	HMACIFY: HMACIFY,
	HMACVerify: HMACVerify
}