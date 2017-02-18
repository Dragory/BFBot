const humanizeDuration = require('humanize-duration');
const util = require('../util');

const bootTime = Date.now();

module.exports = function(bot) {
  bot.registerCommand('status', (msg) => {
    if (! util.canTalk(bot, msg.channel)) return;
    const uptime = Date.now() - bootTime;
    const uptimeStr = humanizeDuration(uptime, {largest: 3, round: true, conjunction: ' and '});

    return `Uptime: ${uptimeStr}`;
  });

  bot.registerCommand('source', 'https://github.com/Dragory/BFBot');
};
