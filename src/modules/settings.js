const settings = require('../settings');

module.exports = function(bot) {
	bot.registerCommand('settings', (msg, args) => {
		if (! msg.member) return;
		if (! msg.member.permission.has('administrator')) return;

		const guild = msg.channel.guild;

		if (args[0] === 'set') {
			if (args.length < 2) return;

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
			if (args.length < 2) return;

			let key = args[1];
			settings.get(guild.id, key)
				.then(value => {
					bot.createMessage(msg.channel.id, `\`${key}\` is \`${value}\``);
				}, e => {
					bot.createMessage(msg.channel.id, `**[ERROR]** ${e.message}`);
				});
		}

		if (args[0] === 'all') {
			settings.getAll(guild.id)
				.then(settings => {
					const text = Object.keys(settings).map(key => {
						const value = settings[key];
						return `\`${key}\` is \`${value}\``;
					}).join('\n');

					bot.createMessage(msg.channel.id, text);
				});
		}
	});
};