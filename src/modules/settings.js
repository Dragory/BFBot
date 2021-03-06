const settings = require('../settings');

module.exports = function(bot) {
  const setCmd = (msg, args) => {
    if (args.length < 2) return;

    let key = args[0];
    let value = args.slice(1).join(' ');

    if (value.trim() === '') {
      settings.reset(msg.channel.guild.id, key).then(() => {
        bot.createMessage(msg.channel.id, `Setting \`${key}\` reset`);
      });
    } else {
      const done = () => bot.createMessage(msg.channel.id, `\`${key}\` is now \`${value}\``);
      const err = (e) => bot.createMessage(msg.channel.id, `**[ERROR]** ${e.message}`);

      // For convenience, strings values can be given like numbers, without quotation marks
      // This is done by assuming the value is a string value if unserializing it fails
      let unserialized;
      try { unserialized = settings.unserialize(value); }
      catch (e) { unserialized = value; }

      settings.set(msg.channel.guild.id, key, unserialized)
        .then(done, e => {
          if (typeof unserialized === 'number') {
            settings.set(msg.channel.guild.id, key, unserialized.toString()).then(done, err);
          } else {
            err(e);
          }
        });
    }
  };

  const getCmd = (msg, args) => {
    if (args.length < 1) return;

    let key = args[0];
    settings.get(msg.channel.guild.id, key)
      .then(value => {
        bot.createMessage(msg.channel.id, `\`${key}\` is \`${value}\``);
      }, e => {
        bot.createMessage(msg.channel.id, `**[ERROR]** ${e.message}`);
      });
  };

  const allCmd = (msg, args) => {
    settings.getAll(msg.channel.guild.id)
      .then(settings => {
        const text = 'Available settings:\n```' + Object.keys(settings).join(', ') + '```';
        bot.createMessage(msg.channel.id, text);
      });
  };

  bot.registerCommand('settings', (msg, args) => {
    if (args[0] === 'set') return setCmd(msg, args.slice(1));
    if (args[0] === 'get') return getCmd(msg, args.slice(1));
    if (args[0] === 'all') return allCmd(msg, args.slice(1));
  });

  bot.registerCommand('s', (msg, args) => {
    if (args.length === 0) return allCmd(msg, args);
    if (args.length === 1) return getCmd(msg, args);
    if (args.length > 1) return setCmd(msg, args);
  });

  bot.registerCommand('sset', setCmd);
  bot.registerCommand('sget', getCmd);
  bot.registerCommand('sall', allCmd);
};
