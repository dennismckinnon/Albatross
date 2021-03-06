var fs = require('fs-extra');
var toml = require('toml');

var config = {};

try {
    configstr = fs.readFileSync('./config.toml');
} catch (error) {
    throw new Error("The config file could not be found");
}

try {
    config = toml.parse(configstr)
} catch (error) {
    throw new Error("The config file could not be parsed");
}

module.exports = config;
