const moment = require('moment');
const util = require('../util');

const bootTime = Date.now();

module.exports = function(bot) {
	bot.registerCommand('status', (msg) => {
		if (! util.canTalk(bot, msg.channel)) return;
		const uptime = Date.now() - bootTime;
		const uptimeStr = moment.duration(uptime, 'milliseconds').humanize();

		return `Uptime: ${uptimeStr}`;
	});

	bot.registerCommand('source', 'https://github.com/Dragory/BFBot');
};