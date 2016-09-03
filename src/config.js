const util = require('./util');

const userConfig = require('../config.js');
const defaultConfig = {
	token: '',
	db: {}
};

module.exports = util.recursiveAssign({}, defaultConfig, userConfig);