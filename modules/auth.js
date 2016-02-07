'use strict;'

//For json web token production and verification
var fs = require('fs-extra');
var jwt = require('jsonwebtoken')
var cfg = require('../core/config').security;

// Nodejs encryption with CTR
var crypto = require('crypto');
var algorithm = 'aes-256-gcm';


//Read these from file?
var Salt = cfg.Salt;
var TokenSecret = cfg.TokenSecret;
var EncryptionSecret = cfg.EncryptionSecret;


function fromHeader(req) {
    if (req.headers.authorization) {
        return req.headers.authorization;
    }
    return null;
}

function makeToken(user) {

	return jwt.sign(user, TokenSecret, {expiresIn: 3600*cfg.tokenExpiry})
}

//This function is just for cleanliness
function makeKey(password) {
    return crypto.pbkdf2Sync(password, Salt, 204800, 32, 'sha256')
}

function makeKeyShort(password) {
    return crypto.pbkdf2Sync(password, Salt, 16, 32, 'sha256')
}

function encrypt(data, secret){
    var iv = crypto.randomBytes(12)
    var cipher = crypto.createCipheriv('aes-256-gcm', secret, iv)
    var encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    var tag = cipher.getAuthTag();
    return {
        encrypted: encrypted,
        tag: tag.toString('hex'),
        iv: iv.toString('hex')
    }
}

function decrypt(data, tag, secret, iv) {

    var decipher = crypto.createDecipheriv('aes-256-gcm', secret, new Buffer(iv, 'hex'))
    decipher.setAuthTag(new Buffer(tag,'hex'));
    var dec = decipher.update(data,'hex','utf8')
    dec += decipher.final('utf8');

    return dec
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    makeKey: makeKey,
    makeToken: makeToken,
    fromHeader: fromHeader
};