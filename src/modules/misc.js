const AsciiTable = require('ascii-table');
const cooldown = require('../cooldown');

module.exports = function(bot) {
  bot.registerCommand('reddit', msg => {
    if (! cooldown.trigger(msg.channel.guild.id, '!reddit', 1000 * 60)) return;

    const text = `
      Battlefield 1: https://www.reddit.com/r/battlefield_one
      Battlefield 3: https://www.reddit.com/r/battlefield3
      Battlefield 4: https://www.reddit.com/r/battlefield_4
      Hardline: https://www.reddit.com/r/BF_Hardline
    `.trim().split('\n').map(v => v.trim()).join('\n');

    bot.createMessage(msg.channel.id, text);
  });

  bot.registerCommand('rolelist', msg => {
    const table = new AsciiTable();
    table.setHeading('id', 'name');

    msg.channel.guild.roles.forEach(role => {
      table.addRow(role.id, role.name);
    });

    msg.channel.createMessage('```' + table.toString() + '```');
  });
};
