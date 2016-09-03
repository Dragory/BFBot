const settings = require('../settings');

module.exports = function(bot) {
	bot.registerCommand('settings', (msg, args) => {
		if (! msg.member) return;
		if (! msg.member.permission.has('administrator')) return;

		if (args.length < 2) return;

		const guild = msg.channel.guild;

		if (args[0] === 'set') {
			let key = args[1];
			let value = args.slice(2).join(' ');

			if (value.trim() === '') {
				settings.reset(guild.id, key).then(() => {
					bot.createMessage(msg.channel.id, `Setting \`${key}\` reset`);
				});
			} else {
				settings.set(guild.id, key, value)
					.then(() => {
						bot.createMessage(msg.channel.id, `\`${key}\` is now \`${value}\``);
					}, e => {
						bot.createMessage(msg.channel.id, `**[ERROR]** ${e.message}`);
					});
			}
		}

		if (args[0] === 'get') {
			let key = args[1];
			settings.get(guild.id, key)
				.then(value => {
					bot.createMessage(msg.channel.id, `\`${key}\` is \`${value}\``);
				}, e => {
					bot.createMessage(msg.channel.id, `**[ERROR]** ${e.message}`);
				});
		}
	});
};