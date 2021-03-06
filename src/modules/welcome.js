const settings = require('../settings');

/**
 * This module can be used to restrict new users to a "welcome channel"
 * where they have to accept the server's rules before proceeding
 */
module.exports = function(bot) {
  const welcomePromises = {};

  bot.on('messageCreate', (msg) => {
    if (! msg.channel.guild) return;
    if (! msg.cleanContent || msg.cleanContent.trim() === '') return;

    const guildId = msg.channel.guild.id;

    if (! welcomePromises[guildId]) {
      welcomePromises[guildId] = [
        settings.get(guildId, 'welcome.channel'),
        settings.get(guildId, 'welcome.command'),
        settings.get(guildId, 'welcome.role'),
      ];
    }

    function maybeDelete() {
      if (msg.member.permission.has('kickMembers')) return;
      msg.delete();
    }

    Promise.all(welcomePromises[guildId]).then(([channelId, cmd, roleId]) => {
      if (msg.channel.id !== channelId) return;
      if (msg.cleanContent.toLowerCase() !== cmd.toLowerCase()) return maybeDelete();
      if (msg.member.roles.indexOf(roleId) !== -1) return maybeDelete();

      msg.member.addRole(roleId).then(maybeDelete);
    });
  });

  bot.registerCommand('refresh_welcome', (msg) => {
    welcomePromises[msg.channel.guild.id] = null;
  });
};
