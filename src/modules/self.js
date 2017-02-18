const fs = require('fs');
const config = require('../config');

module.exports = function(bot) {
  const updateSelf = (username, avatar) => {
    let params = {};
    if (username) params.username = username;
    if (avatar) params.avatar = avatar;

    return bot.editSelf(params);
  };

  bot.registerCommand('self_refresh', msg => {
    if (! msg.member) return;
    if (! msg.member.permission.has('administrator')) return;

    if (config.avatar) {
      fs.readFile(config.avatar, (err, data) => {
        const base64data = 'data:image/jpeg;base64,' + (new Buffer(data)).toString('base64');
        updateSelf(config.username, base64data)
          .then(() => bot.createMessage(msg.channel.id, 'Updated username and avatar'))
          .catch(e => {
            bot.createMessage(msg.channel.id, 'Error while updating username and/or avatar: ' + e.response);
          });
      });
    } else if (config.username) {
      updateSelf(config.username).then(() => bot.createMessage(msg.channel.id, 'Updated username'));
    }
  });
};
