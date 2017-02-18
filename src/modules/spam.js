/**
 * Spam prevention
 */
module.exports = function(bot) {
  function checkForSpam(msg) {
    if (! msg.channel.guild) return;
    if (! msg.content || msg.content.trim() === '') return;
    if (msg.member.permission.has('kickMembers')) return;

    let deleted = false;
    function deleteMessage() {
      if (deleted) return;
      deleted = true;

      msg.delete();
    }

    // Remove external invites
    const matcher = /discord\.gg\/([\S]+)/gi;
    let match;

    while ((match = matcher.exec(msg.content)) !== null) {
      const inviteId = match[1];
      bot.getInvite(inviteId).then(invite => {
        if (invite.guild.id !== msg.channel.guild.id) deleteMessage();
      });
    }

    if (msg.content.match(/discord\.me\/[\S]+/i) !== null) deleteMessage();
  }

  bot.on('messageCreate', checkForSpam);
  bot.on('messageUpdate', checkForSpam);
};
